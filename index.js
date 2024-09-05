require('dotenv').config()
const path = require("path");
const express = require('express');
const userRoute =require('./routes/user');
const blogRouter =require('./routes/blog');
const Blog = require('./models/blog');

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {checkForAuthenticationCookie} = require("./middlewares/authentication");


const app = express();
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URL).then(e => console.log('MongoDB connected'))

app.use(express.static(path.resolve("./public")));
app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get('/', async(req, res) => {
     const allBlogs = await Blog.find({}).populate("createdBy");; 
    
     console.log(req.user);

     res.render('home', {
        user: req.user,
        blogs: allBlogs,
        currentPage: 'home',
    });  
});

app.get('/admin',(req, res) => {
    return res.render('admin');
});

app.use("/user", userRoute);
app.use("/blog", blogRouter);


app.listen(PORT, () => {
   console.log(`Server started at PORT: ${PORT}`);  
});
