require('dotenv').config();
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file!");
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}
connectDB();

// ✅ Define Mongoose Schema (REMOVED facility)
const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  from: String,
  to: String,
  travelDate: String,
  time: String,   // Ensure this is here
  gender: String, // Ensure this is here
  numberOfPeople: Number,
});

const BookingModel = mongoose.model('Booking', bookingSchema);

// ✅ GraphQL Schema (REMOVED facility)
const typeDefs = gql`
  type Booking {
    id: ID!
    name: String!
    email: String!
    from: String!
    to: String!
    travelDate: String!
    time: String!    # ✅ Ensuring "time" is included
    gender: String!  # ✅ Ensuring "gender" is included
    numberOfPeople: Int!
  }

  input BookingInput {
    name: String!
    email: String!
    from: String!
    to: String!
    travelDate: String!
    time: String!
    gender: String!
    numberOfPeople: Int!
  }

  type Query {
    getBookings: [Booking]
  }

  type Mutation {
    createBooking(input: BookingInput!): Booking
    updateBooking(id: ID!, input: BookingInput!): Booking
    deleteBooking(id: ID!): String
  }
`;

// ✅ GraphQL Resolvers (Ensuring time & gender save correctly)
const resolvers = {
  Query: {
    getBookings: async () => {
      return await BookingModel.find({}, { name: 1, email: 1, from: 1, to: 1, travelDate: 1, time: 1, gender: 1, numberOfPeople: 1 });
    },
  },
  Mutation: {
    createBooking: async (_, { input }) => {
      const newBooking = new BookingModel(input);
      return await newBooking.save();
    },
    updateBooking: async (_, { id, input }) => {
      return await BookingModel.findByIdAndUpdate(id, input, { new: true });
    },
    deleteBooking: async (_, { id }) => {
      await BookingModel.findByIdAndDelete(id);
      return id;
    },
  },
};


// ✅ Start Apollo Server
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    debug: true,
    formatError: (err) => {
      console.error("🚨 GraphQL Error:", err);
      return err;
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});


  app.listen(4000, () => {
    console.log(`🚀 Server running at http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();
