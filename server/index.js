import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehical';

const registrationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    comments: {
      type: String,
      default: '',
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      required: true,
      enum: ['Online', 'Offline'],
    },
    favCar: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

const Registration = mongoose.model('Registration', registrationSchema);

app.use(cors());
app.use(express.json());

function validateRegistration(payload) {
  const requiredFields = ['firstName', 'lastName', 'email', 'mode', 'favCar'];
  const missingField = requiredFields.find((field) => !payload[field]?.toString().trim());

  if (missingField) {
    return `${missingField} is required`;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    return 'Valid email is required';
  }

  return null;
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: mongoose.connection.readyState === 1,
    message: 'Registration backend is running.',
    database: MONGODB_URI,
  });
});

app.get('/api/registrations', async (_request, response) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 }).lean();
    response.json(
      registrations.map((registration) => ({
        ...registration,
        id: registration._id.toString(),
      })),
    );
  } catch {
    response.status(500).json({ message: 'Unable to load registrations.' });
  }
});

app.post('/api/registrations', async (request, response) => {
  try {
    const errorMessage = validateRegistration(request.body);

    if (errorMessage) {
      return response.status(400).json({ message: errorMessage });
    }

    const registration = await Registration.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      comments: request.body.comments,
      isVisible: request.body.isVisible,
      mode: request.body.mode,
      favCar: request.body.favCar,
    });

    return response.status(201).json({
      message: 'Registration saved successfully.',
      registration: {
        ...registration.toObject(),
        id: registration._id.toString(),
      },
    });
  } catch {
    return response.status(500).json({ message: 'Unable to save registration.' });
  }
});

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log(`MongoDB connected at ${MONGODB_URI}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
