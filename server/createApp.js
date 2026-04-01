import cors from 'cors';
import express from 'express';
import { connectToDatabase, MONGODB_URI } from './db.js';
import { Registration } from './models.js';

export function validateRegistration(payload) {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'mode', 'favCar'];
  const missingField = requiredFields.find((field) => !payload[field]?.toString().trim());

  if (missingField) {
    return `${missingField} is required`;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    return 'Valid email is required';
  }

  const phonePattern = /^[0-9+\-\s()]{7,20}$/;
  if (!phonePattern.test(payload.phone)) {
    return 'Valid phone number is required';
  }

  return null;
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  async function deleteRegistrationById(registrationId, response) {
    try {
      await connectToDatabase();

      if (!registrationId) {
        return response.status(400).json({ message: 'Registration id is required.' });
      }

      const deletedRegistration = await Registration.findByIdAndDelete(registrationId);

      if (!deletedRegistration) {
        return response.status(404).json({ message: 'Registration not found.' });
      }

      return response.json({ message: 'Registration deleted successfully.' });
    } catch {
      return response.status(500).json({ message: 'Unable to delete registration.' });
    }
  }

  app.get('/api/health', async (_request, response) => {
    try {
      await connectToDatabase();
      response.json({
        ok: true,
        message: 'Registration backend is running.',
        database: MONGODB_URI,
      });
    } catch {
      response.status(503).json({
        ok: false,
        message: 'Unable to connect to the registration database.',
      });
    }
  });

  app.get('/api/registrations', async (_request, response) => {
    try {
      await connectToDatabase();
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

      await connectToDatabase();

      const registration = await Registration.create({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
        phone: request.body.phone,
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

  app.delete('/api/registrations', async (request, response) =>
    deleteRegistrationById(request.query.id || request.body?.id, response),
  );

  app.delete('/api/registrations/:id', async (request, response) => {
    return deleteRegistrationById(request.params.id, response);
  });

  return app;
}
