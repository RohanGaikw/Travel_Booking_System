import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_BOOKINGS = gql`
  query {
    getBookings {
      id
      name
      email
      from
      to
      travelDate
      time
      gender
      numberOfPeople
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      id
      name
      email
      from
      to
      travelDate
      time
      gender
      numberOfPeople
    }
  }
`;

const UPDATE_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $input: BookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      name
      email
      from
      to
      travelDate
      time
      gender
      numberOfPeople
    }
  }
`;

const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;

export default function App() {
  const { loading, error, data } = useQuery(GET_BOOKINGS);
  const [createBooking] = useMutation(CREATE_BOOKING, {
    refetchQueries: [{ query: GET_BOOKINGS }],
  });
  const [updateBooking] = useMutation(UPDATE_BOOKING, {
    refetchQueries: [{ query: GET_BOOKINGS }],
  });
  const [deleteBooking] = useMutation(DELETE_BOOKING, {
    refetchQueries: [{ query: GET_BOOKINGS }],
  });

  const initialState = {
    name: "",
    email: "",
    from: "",
    to: "",
    travelDate: "",
    time: "",
    gender: "",
    numberOfPeople: 1,
  };

  const [newBooking, setNewBooking] = useState(initialState);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({
      ...prev,
      [name]: name === "numberOfPeople" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newBooking.name ||
      !newBooking.email ||
      !newBooking.from ||
      !newBooking.to ||
      !newBooking.travelDate ||
      !newBooking.time ||
      !newBooking.gender ||
      !newBooking.numberOfPeople
    ) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const { __typename, id, ...bookingData } = newBooking;

    try {
      if (editingId) {
        await updateBooking({ variables: { id: editingId, input: bookingData } });
        setEditingId(null);
      } else {
        await createBooking({ variables: { input: bookingData } });
      }
      setNewBooking(initialState);
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleEdit = (booking) => {
    setNewBooking(booking);
    setEditingId(booking.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking({ variables: { id } });
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (error) return <p className="text-danger text-center">Error fetching data</p>;

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: "linear-gradient(to right, #8A2387, #E94057, #F27121)",
        padding: "40px"
      }}>
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "600px", width: "100%", background: "#fff" }}>
        <h2 className="text-center text-dark fw-bold">Travel Booking System</h2>
        <form onSubmit={handleSubmit} className="mt-3">
          <input className="form-control mb-2" type="text" name="name" value={newBooking.name} onChange={handleChange} placeholder="Name" required />
          <input className="form-control mb-2" type="email" name="email" value={newBooking.email} onChange={handleChange} placeholder="Email" required />
          <input className="form-control mb-2" type="text" name="from" value={newBooking.from} onChange={handleChange} placeholder="From" required />
          <input className="form-control mb-2" type="text" name="to" value={newBooking.to} onChange={handleChange} placeholder="To" required />
          <input className="form-control mb-2" type="date" name="travelDate" value={newBooking.travelDate} onChange={handleChange} required />
          <input className="form-control mb-2" type="time" name="time" value={newBooking.time} onChange={handleChange} required />
          <select className="form-select mb-2" name="gender" value={newBooking.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input className="form-control mb-3" type="number" name="numberOfPeople" value={newBooking.numberOfPeople} onChange={handleChange} min="1" required />
          <button type="submit" className="btn btn-primary w-100">
            {editingId ? "Update Booking" : "Book"}
          </button>
        </form>

        <ul>
      {data.getBookings.map((booking) => (
        <li key={booking.id}>
          <strong>Name:</strong> {booking.name} <br />
          <strong>From:</strong> {booking.from} → <strong>To:</strong> {booking.to} <br />
          <strong>Travel Date:</strong> {booking.travelDate} <br />
          <strong>Time:</strong> {booking.time} <br />
          <strong>Gender:</strong> {booking.gender} <br />
          <strong>People:</strong> {booking.numberOfPeople} <br />
          <button onClick={() => handleEdit(booking)}>Edit</button>
          <button onClick={() => handleDelete(booking.id)}>Delete</button>
        </li>
      ))}
    </ul>

      </div>

      <div className="mt-4 card shadow-lg p-4 rounded-4" style={{ maxWidth: "700px", width: "100%", background: "#fff" }}>
        <h3 className="text-center text-dark fw-bold">Bookings List</h3>
        <ul className="list-group">
          {data.getBookings.map((booking) => (
            <li key={booking.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{booking.name}</strong> - {booking.from} to {booking.to} on {booking.travelDate}
              </div>
              <div>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(booking)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(booking.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
