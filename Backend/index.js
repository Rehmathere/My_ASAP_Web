const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: "node.env" });
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const Seller = require("./models/Seller");
const Message = require("./models/Message");
const Payment = require("./models/Payment");
const DeltaPayment = require("./models/DeltaPayment");
const City = require("./models/City");
const Product = require("./models/Prodct");
const Booking = require("./models/Booking");
const ServiceProvider = require("./models/Serviceprovider");
const Category = require("./models/Category");
const User = require("./models/User");
const Services = require("./models/Services");
const Request = require("./models/Request");
const app = express();
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "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"
); // Replace with your actual Stripe secret key
app.use(bodyParser.json({ limit: "50mb" }));

require("./db/conn");
const jwtToken = require("jsonwebtoken");
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
app.use(express.static(static_path));
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get("/", (req, res) => {
  res.send("Hello from me");
});

app.listen(8000, () => {
  console.log(`Server is running on 8000`);
});
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. Token missing or invalid format." });
  }

  const tokenWithoutBearer = token.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(tokenWithoutBearer, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};
app.post("/signup", async (req, res) => {
  try {
    const { Name, password, email, phoneNumber, zipCode } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      } else if (existingUser.phoneNumber === phoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number already registered" });
      }
    }
    const newUser = new User({
      Name,
      password,
      email,
      phoneNumber,
      zipCode,
    });

    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.post("/seller-signup", async (req, res) => {
  try {
    const {
      Name,
      password,
      email,
      phoneNumber,
      categoryId,
      productId,
      city,
      latitude,
      longitude,
      country,
      zipCode,
      experience,
      details,
    } = req.body;

    const existingUser = await Seller.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already registered" });
      } else if (existingUser.phoneNumber === phoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number already registered" });
      }
    }
    const newUser = new Seller({
      Name,
      city,
      country,
      password,
      email,
      category: categoryId, // Assign categoryId to the category field
      product: productId, // Assign productId to the product field
      phoneNumber,
      zipCode,
      // s
      experience,
      details,
    });

    await newUser.save();

    res.status(200).json({ message: "Seller registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/seller-update-profile" , async (req,res)=>{
  const {sellerId , Name , email, phoneNumber , details } = req.body
  console.log(sellerId , Name , email, phoneNumber , details )
  console.log("hello")
  try{
    const seller = await Seller.findById(sellerId);
    const updatedSeller = await Seller.findByIdAndUpdate(sellerId , {
      Name:Name ||  seller.Name,
      email : email || seller.email ,
      phoneNumber: phoneNumber || seller.phoneNumber,
      details:details|| seller.details
    },{new:true}) ;
    res.status(201).json(updatedSeller);
  }
  catch(error){
    res.status(400).json(error)
  }
})


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid User" });
    }

    if (user.isDeleted) {
      return res
        .status(403)
        .json({ success: false, message: "User account is deactivated" });
    }

    if (user.password !== password) {
      console.log(user);
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password", data: user });
    }

    let payStatus;
    if (user && user.isDeleted === false) {
      try {
        payStatus = await Payment.findOne({ userId: user._id, expired: false });
        // console.log(status.isPaid);
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    }

    //  const token = jwt.sign({ userId: user._id }, secretKey, {
    // expiresIn: "1h",
    //});

    res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user._id,
      userType: user.userType,
      payStatus: payStatus,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
app.post("/seller-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Seller.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid User" });
    }

    if (user.isDeleted) {
      return res
        .status(403)
        .json({ success: false, message: "User account is deactivated" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    //const token = jwt.sign({ userId: user._id }, secretKey, {
    //expiresIn: "1h",
    //});

    res
      .status(200)
      .json({ success: true, message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
app.post("/logout", (req, res) => {
  // Assuming the token is sent in the Authorization header
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }

  // Here, you would perform any additional validation or processing related to logging out
  // For example, you might revoke the token, update the user's status, etc.

  // Respond with a success message
  res.status(200).json({ success: true, message: "Logout successful" });
});
app.get("/check-auth", authenticateToken, (req, res) => {
  // If the code reaches here, it means the user is authenticated
  // You can return additional user information if needed
  res.json({ isAuthenticated: true, userId: req.userId });
});
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route.", userId: req.userId });
});
app.post("/city", async (req, res) => {
  try {
    const { cityname } = req.body;
    const newCity = new City({
      cityname,
    });

    await newCity.save();

    res.status(200).json({ message: "City registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/users", async (req, res) => {
  try {
    const allusers = await User.find({}); // Query all cities and project only the 'cityname' field
    res.status(200).json(allusers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching cities" });
  }
});
app.get("/getallsellers", async (req, res) => {
  try {
    const allusers = await Seller.find({}); // Query all cities and project only the 'cityname' field
    res.status(200).json(allusers);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching cities" });
  }
});
app.get("/cities", async (req, res) => {
  try {
    const cities = await City.find({}, "cityname"); // Query all cities and project only the 'cityname' field
    res.status(200).json(cities);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching cities" });
  }
});
app.post("/services", async (req, res) => {
  try {
    const { name } = req.body;
    const newServices = new Services({
      name,
    });

    await newServices.save();

    res.status(200).json({ message: "Services registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/services", async (req, res) => {
  try {
    const services = await Services.find({}, "name"); // Query all cities and project only the 'cityname' field
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching cities" });
  }
});
app.post("/serviceprovider", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      Name,
      email,
      phoneNumber,
      city,
      product,
      location,
      distance,
      availability,
    } = req.body;
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    // Create a new Serviceprovider instance
    const serviceprovider = new ServiceProvider({
      Name,
      email,
      phoneNumber,
      city,
      product,
      location,
      distance,
      availability,
    });

    // Save the data to the database
    await serviceprovider.save();

    res.status(201).json({ message: "Location data saved successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while saving location data" });
  }
});
app.get("/serviceprovider", async (req, res) => {
  try {
    const Services = await ServiceProvider.find(
      {},
      "Name email phoneNumber city category location distance availability"
    ); // Query all cities and project only the 'cityname' field
    res.status(200).json(Services);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching cities" });
  }
});
app.post("/Category", async (req, res) => {
  try {
    const { Title, image } = req.body;
    if (!Title || !image) {
      throw new Error("Missing parameter");
    }

    let existingCategory = await Category.findOne({ Title });

    if (existingCategory) {
      if (existingCategory.isDeleted) {
        // If the existing category is marked as deleted, update it to set isDeleted to false
        existingCategory.isDeleted = false;
        existingCategory.image = image;
        await existingCategory.save();
        return res
          .status(200)
          .json({ message: "Category already existed and is now restored" });
      } else {
        return res.status(400).json({ message: "Category already registered" });
      }
    }

    const newCategory = new Category({
      Title,
      image,
    });

    await newCategory.save();

    res.status(200).json({ message: "Category registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/Category", async (req, res) => {
  try {
    const Services = await Category.find({ isDeleted: false }); // Query categories where isDeleted is false
    res.status(200).json(Services);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching categories" });
  }
});

app.get("/Category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching category by ID" });
  }
});
app.post("/product", async (req, res) => {
  try {
    const { name, categoryId, image } = req.body;
    console.log(name, categoryId, image);

    // Check if the categoryId exists in the Category model
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already registered" });
    }

    const newProduct = new Product({
      name,
      category: categoryId,
      image,
    });

    await newProduct.save();

    res.status(200).json({ message: "Product registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/product", async (req, res) => {
  try {
    const categoryId = req.query.categoryId;

    // Create a filter object to use in the query
    const filter = categoryId ? { category: categoryId, isDeleted: false } : {};

    // Fetch products based on the filter
    const products = await Product.find(filter);

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
});
app.get("/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching product by ID" });
  }
});
app.get("/category/:categoryId/products", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check if the category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Fetch products for the specified category
    const products = await Product.find({
      category: categoryId,
      isDeleted: false,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/seller-form", async (req, res) => {
  try {
    const { category, product, location, address } = req.body;
    const newUser = new Sellerform({
      category,
      location,
      product,
      address,
    });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
app.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Fetch user details by ID
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Return all user details
    res.status(200).json({ success: true, user: user.toObject() });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
app.get("/getallsellers/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Fetch user details by ID
    const user = await Seller.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
app.post("/api/logout", (req, res) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);
    // Additional checks, if needed...

    // If everything is fine, perform logout operations
    // ...

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});
app.post("/bookings", async (req, res) => {
  try {
    const { userId, productId, sellerId } = req.body;
    // Create a new booking
    console.log(req.body.sellerName);
    const newBooking = await Booking.create({
      ...req.body
    })
    // SEND EMAIL ...................
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // service: 'gmail',
      auth: {
        user: "inquiriesesa@gmail.com",
        pass: "vdaqhaybecipeldj",
      },
    });

    // Email options
    let mailOptions = {
      from: "inquiriesesa@gmail.com",
      to: req.body.sellerEmail,
      subject: "You Have Recieved A New Booking",
      text: `
      Hello ${req.body.sellerName},

      You have received a new booking for your service. Please review the detail on your dashboard and take necessary actions accordingly.
      Thank you for your cooperation.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        res
          .status(200)
          .json({ message: "User found. Email sent.", ok: true });
      }
    });
    // SEND EMAIL END ...................
    res.status(201).json(newBooking);

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/bookings", async (req, res) => {
  try {
    const allBookings = await Booking.find().populate("user product seller");
    res.status(200).json(allBookings);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching bookings" });
  }
});
app.delete("/bookings/:id", async (req, res) => {
  try {
    // Extract the booking ID from the request parameters
    const bookingId = req.params.id;
    const buyerEmail = req.query.buyerEmail;
    const buyerName = req.query.buyerName
    const sellerName = req.query.sellerName
    // Check if the booking ID is valid
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    // Find the booking by its ID and delete it
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    // Check if the booking was found and deleted successfully
    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Send a success response with the deleted booking data
    res.status(200).json(deletedBooking);

    // EMAIL SEND ...............
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // service: 'gmail',
      auth: {
        user: "inquiriesesa@gmail.com",
        pass: "vdaqhaybecipeldj",
      },
    });

    // Email options
    let mailOptions = {
      from: "inquiriesesa@gmail.com",
      to: buyerEmail,
      subject: "Your request has been rejected",
      text: `Dear ${buyerName},

      We regret to inform you that your recent request has been declined by our service provider, Mr. ${sellerName}. We understand this may be disappointing and we are available to discuss any alternative solutions that may meet your needs.
      
      Kind regards,
      ASAP Services,
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        res
          .status(200)
          .json({ message: "User found. Email sent.", ok: true });
      }
    });
    // EMAIL END .............

  } catch (error) {
    // Handle errors and send an error response
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

app.patch("/updateBooking/:id" ,async (req,res)=>{
  const bookingId = req.params.id
  const buyerEmail = req.query.buyerEmail;
  const buyerName = req.query.buyerName
  const sellerName = req.query.sellerName
  try {
  const booking = await Booking.findByIdAndUpdate({_id:bookingId} , {ordered:true} , {new:true})
  if(!booking){
   throw new Error("Booking Not Found") 
  }  
  // EMAIL SEND ...............
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // service: 'gmail',
      auth: {
        user: "inquiriesesa@gmail.com",
        pass: "vdaqhaybecipeldj",
      },
    });

    // Email options
    let mailOptions = {
      from: "inquiriesesa@gmail.com",
      to: buyerEmail,
      subject: "Your request has been Accepted",
      text: `Dear ${buyerName},

      We regret to inform you that your recent request has been Accepted by our service provider, Mr. ${sellerName}. 
      
      Kind regards,
      ASAP Services,
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        res
          .status(200)
          .json({ message: "User found. Email sent.", ok: true });
      }
    });
    // EMAIL END .............
  res.status(200).json(booking)
  } catch (error) {
    console.log("here")
    res.status(400).json({error:error.message , ok:false})
  }
  
})

app.get("/specificbooking", async (req, res) => {
  try {
    const { sellerId } = req.query;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    const sellerBookings = await Booking.find({ seller: sellerId }).populate(
      "user product seller"
    );
    res.status(200).json(sellerBookings);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching bookings" });
  }
});
app.post("/messages", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const newMessage = new Message({ sender, receiver, message });
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/messages", async (req, res) => {
  try {
    const { userId, sellerId } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: sellerId },
        { sender: sellerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 }); // Use 'createdAt' instead of 'timestamp'

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Request received at /create-checkout-session");

    const { paymentMethodId, userId, productId, zipCode, city } = req.body; // Destructure values from request body
    console.log("Product ID:", productId);
    console.log("Zip Code:", zipCode);
    console.log("City:", city);

    // Retrieve product details based on the paymentMethodId
    const items = [
      {
        price: "price_1P6bhaH9HQ2Ek1tPWKH1k7WL", // Your product price ID
        quantity: 1,
      },
      // Add more items if needed
    ];

    // Construct success and cancel URLs with parameters
    const success_url = `http://${
      req.headers.host
    }/success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&productId=${productId}${
      zipCode ? "&zipCode=" + zipCode : ""
    }${city ? "&city=" + city : ""}`;
    const cancel_url = `https://asap-new-backend.vercel.app/cancel?userId=${userId}&productId=${productId}&zipCode=${
      zipCode || ""
    }&city=${city || ""}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
    });

    // Append session ID to success URL
    session.success_url += `?session_id=${session.id}`;

    // Return the session ID to the client
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
});

app.get("/success", async (req, res) => {
  try {
    console.log("Query Parameters:", req.query); // Log the entire req.query object
    const sessionId = req.query.session_id; // Correctly extract session ID from query parameters
    console.log("Session ID:", sessionId); // Log the session ID for debugging
    if (!sessionId) {
      throw new Error("Session ID is missing in query parameters.");
    }

    const userId = req.query.userId;
    console.log("User ID:", userId);

    const productId = req.query.productId;
    console.log("Product ID:", productId);

    const zipCode = req.query.zipCode;
    console.log("Zip Code:", zipCode);

    const city = req.query.city;
    console.log("City:", city);

    // Retrieve the session from Stripe to check its payment status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Check if payment record already exists for the user
      let payment = await Payment.findOne({ userId: userId });
      // if (payment) {
      //   // Update existing payment record
      //   payment.isPaid = true;
      //   payment.zipCode = zipCode;
      //   payment.city = city;
      // } else {
      // Create new payment record
      payment = new Payment({
        sessionId: session.id,
        userId: userId,
        isPaid: true,
        zipCode: zipCode,
        city: city,
        // Add more payment-related fields as needed
      });

      // Save the payment record
      await payment.save();
      console.log("Payment Record Saved to Database");
    } else {
      console.error("Payment was not successful.");
    }
    // Redirect to seller panel with productId, zipCode, and city parameters
    res.redirect(
      `http://getasapservice.com/card.html?productId=${productId}&zipCode=${
        zipCode || ""
      }&city=${city || ""}&paidNow=${true}`
    );
  } catch (error) {
    console.error("Error handling success redirect:", error);
    res.status(500).json({ error: "Error handling success redirect" });
  }
});

// Cancel URL endpoint for Stripe Checkout
app.get("/cancel", (req, res) => {
  res.redirect("http://127.0.0.1:5500/ASSP/index.html"); // Redirect to login page if payment is cancelled
});
app.post("/delta-checkout-session", async (req, res) => {
  try {
    console.log("Request received at /create-checkout-session");

    const { paymentMethodId, email } = req.body; // Get userId from the request body
    console.log("Received Token:", req.header("Authorization"));
    console.log("Authenticated User ID:", email);

    // Retrieve product details based on the paymentMethodId
    const items = [
      {
        price: "price_1OhHCMH9HQ2Ek1tPDpXnGNlO", // Your product price ID
        quantity: 1,
      },
      // Add more items if needed
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: "https://dtouristics.com/Login",
      cancel_url: "https://asap-new-backend.vercel.app/cancel",
    });

    console.log("Checkout Session Created:", session);

    const payment = new DeltaPayment({
      sessionId: session.id,
      email: email,
      // Add more payment-related fields as needed
    });

    // Save the payment record to the database
    await payment.save();
    console.log("Payment Record Saved to Database");

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
});

//Filter based on country city and zipcode
app.get("/getFilteredSellers", async (req, res) => {
  const city = req.headers.city;
  const zipCode = req.headers.zipcode;
  const category = req.headers.category;
  const product = req.headers.product;

  try {
    let filter = {}; // Initialize an empty filter object

    // Check if city is provided
    if (city) {
      filter.city = city;
    }

    // Check if zip code is provided
    if (zipCode) {
      filter.zipCode = zipCode;
    }

    // Check if category is provided
    if (category) {
      const categoryDoc = await Category.findById(category);

      if (!categoryDoc) {
        return res.status(404).json({ message: "Category not found" });
      }

      filter.category = category; // Include category in the filter
    }
    if (product) {
      // Find product title using its ObjectId
      const productDoc = await Product.findById(product);

      if (!productDoc) {
        return res.status(404).json({ message: "Product not found" });
      }

      filter.product = product; // Include product in the filter
    }

    const filteredSellers = await Seller.find(filter)
      .populate("category", "Title")
      .populate("product", "name");

    res.status(200).json({ data: filteredSellers });
  } catch (error) {
    res.status(400).json({ message: "Error filtering the sellers" });
  }
});

app.post("/forgotPassword", async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ email, phoneNumber });
    console.log(user.password);

    if (user) {
      // Create a Nodemailer transporter
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        // service: 'gmail',
        auth: {
          user: "inquiriesesa@gmail.com",
          pass: "vdaqhaybecipeldj",
        },
      });

      // Email options
      let mailOptions = {
        from: "inquiriesesa@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `As part of our commitment to ensuring the security and confidentiality of your account, we are providing you with your access credentials via this secure communication channel.

        Please find below your password:
        
        Password: ${user.password}
        
        We highly value the privacy of your information and have taken every precaution to transmit these credentials securely. If you have any concerns or questions regarding your account security, please do not hesitate to reach out to our support team.
        
        Thank you for your cooperation.`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ message: "Failed to send email." });
        } else {
          console.log("Email sent: " + info.response);
          res
            .status(200)
            .json({ message: "User found. Email sent.", ok: true });
        }
      });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
});

app.delete("/deleteUser/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({ ok: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Error deleting" });
  }
});

app.delete("/deleteCategory/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  // console.log(categoryId);
  try {
    const updatedUser = await Category.findByIdAndUpdate(
      categoryId,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({ ok: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Error deleting" });
  }
});

app.delete("/deleteProduct/:productId", async (req, res) => {
  const productId = req.params.productId;
  // console.log(categoryId);
  try {
    const updatedUser = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({ ok: true, data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: "Error deleting" });
  }
});

app.get("/getAllPayments", async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "userId",
      select: "Name email phoneNumber",
    });
    res.status(200).json({ data: payments, ok: true });
  } catch (error) {
    res.status(400).json({ message: "Error getting all payments" });
  }
});

app.post("/postRequest", async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const existingRequest = await Request.findOne({
      userId,
      status: "pending",
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Your request is already pending" });
    }
    const request = new Request({ userId });
    await request.save();

    res.status(200).json({ data: request, ok: true });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.get("/getAllRequests", async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" }).populate(
      "userId",
      "Name email phoneNumber"
    );

    res.status(200).json({ data: requests, ok: true });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.put("/updateReq/:id", async (req, res) => {
  const id = req.params.id;
  const { status, userId } = req.body;
  console.log(userId, status);

  try {
    // Update the request
    const updatedReq = await Request.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    // If the status is 'accepted', update the payment
    if (status === "accepted") {
      const updatedUser = await Payment.create({
        userId: userId,
        isPaid: true,
      });
      console.log(updatedUser);
    }

    // If the request is not found, return 404 response
    if (!updatedReq) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Return success response with updated request data
    res.status(200).json({ ok: true, data: updatedReq });
  } catch (error) {
    // Handle errors
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/checkExpired/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const expired = await Payment.findOne({ userId: userId, expired: false });
    console.log(expired);
    if (expired) {
      const dateCreated = new Date(expired.dateAdded);
      const currentDate = new Date();
      const differenceInMilliseconds = currentDate - dateCreated;
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
      console.log(differenceInDays);
      if (differenceInDays > 30) {
        expired.expired = true;
        await expired.save();
        return res.status(200).json({ ok: false, expired: true });
      } else {
        return res.status(200).json({
          data: expired,
          message: "Payment is not expired.",
          ok: true,
        });
      }
    }
    // If no payment is found, send a response indicating that
    return res
      .status(200)
      .json({ message: "No payment found. or payment is expired" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/getOneUser/:id" ,async (req,res)=>{
  try {
    const user = await User.findById(req.params.id);
    if(!user){
      throw new Error("User Not Found")
    }
    res.status(200).json(user);
  } catch (error) {
    res.status.json(error);
  }
})


app.post("/seller/update" ,async (req,res)=>{
  const image = req.body.image
  const sellerId = req.body.sellerId
  
  try {
    const  updatedSeller= await Seller.findByIdAndUpdate(sellerId , {image:image} , {new:true})
    if (!updatedSeller) {
      throw new Error("SERVER ISSUE FACED")
    }
    res.status(201).json(updatedSeller)
  } catch (error) {
    res.status(400).json(error)
  }
})
