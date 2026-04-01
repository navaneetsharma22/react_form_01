import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './App.css';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  comments: '',
  isVisible: false,
  mode: 'Online',
  favCar: 'thar',
};

const vehicleOptions = [
  {
    value: 'thar',
    label: 'Mahindra Thar',
    accent: 'Adventure',
    image: '/vehicles/mahindra-thar.avif',
    creditLabel: 'Local image',
    creditHref: '#',
  },
  {
    value: 'fortuner',
    label: 'Toyota Fortuner',
    accent: 'Executive',
    image: '/vehicles/fortuner.jpg',
    creditLabel: 'Local image',
    creditHref: '#',
  },
  {
    value: 'scorpio',
    label: 'Mahindra Scorpio',
    accent: 'Bold',
    image: '/vehicles/scorpio.avif',
    creditLabel: 'Local image',
    creditHref: '#',
  },
  {
    value: 'sierra',
    label: 'Tata Sierra',
    accent: 'Future',
    image: '/vehicles/sierra.avif',
    creditLabel: 'Local image',
    creditHref: '#',
  },
  {
    value: 'harrier',
    label: 'Tata Harrier',
    accent: 'Urban',
    image: '/vehicles/harrier.avif',
    creditLabel: 'Local image',
    creditHref: '#',
  },
  {
    value: 'mahindra-be-6',
    label: 'Mahindra BE 6',
    accent: 'Electric',
    image: '/vehicles/mahindra-be-6.webp',
    creditLabel: 'Local image',
    creditHref: '#',
  },
];

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [backendReady, setBackendReady] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [expandedRegistrationId, setExpandedRegistrationId] = useState(null);
  const [deletingRegistrationId, setDeletingRegistrationId] = useState(null);

  const shellRef = useRef(null);
  const formRef = useRef(null);
  const statRef = useRef(null);
  const summaryRef = useRef(null);
  const feedRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-content > *',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
        },
      );

      gsap.fromTo(
        '.field-card, .switch-card, .mode-card, .vehicle-card',
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: 'power2.out',
          stagger: 0.05,
          delay: 0.2,
        },
      );

      gsap.to('.orb', {
        yPercent: -12,
        xPercent: 8,
        duration: 8,
        ease: 'sine.inOut',
        stagger: 1,
        repeat: -1,
        yoyo: true,
      });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    async function loadRegistrations() {
      try {
        const healthResponse = await fetch('/api/health');
        setBackendReady(healthResponse.ok);

        const response = await fetch('/api/registrations');
        if (!response.ok) {
          throw new Error('Unable to load registrations');
        }

        const data = await readJsonResponse(response);
        setRegistrations(data);
      } catch {
        setBackendReady(false);
      }
    }

    loadRegistrations();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setShowcaseIndex((current) => (current + 1) % vehicleOptions.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!summaryRef.current || !isSubmitted) {
      return;
    }

    gsap.fromTo(
      summaryRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    );
  }, [isSubmitted]);

  useEffect(() => {
    if (!feedRef.current || registrations.length === 0) {
      return;
    }

    gsap.fromTo(
      '.backend-card',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
    );
  }, [registrations]);

  const completion = Math.round(
    ([
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.comments,
      formData.mode,
      formData.favCar,
      formData.isVisible,
    ].filter(Boolean).length /
      8) *
      100,
  );

  async function readJsonResponse(response) {
    const raw = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      throw new Error(
        response.ok
          ? 'The server returned an unexpected response instead of JSON.'
          : 'The API route is unavailable or misconfigured.',
      );
    }

    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('The server returned invalid JSON.');
    }
  }

  function changeHandler(event) {
    const { name, value, checked, type } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setRegistrations((current) => [data.registration, ...current]);
      setMessage(data.message);
      setIsSubmitted(true);

      gsap.to(formRef.current, {
        y: -6,
        duration: 0.18,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });

      gsap.fromTo(
        statRef.current,
        { scale: 0.96 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)' },
      );
    } catch (submitError) {
      setError(submitError.message || 'Unable to connect to backend');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteRegistration(registrationId) {
    setError('');
    setMessage('');
    setDeletingRegistrationId(registrationId);

    try {
      const response = await fetch(`/api/registrations?id=${registrationId}`, {
        method: 'DELETE',
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete registration');
      }

      setRegistrations((current) =>
        current.filter((registration) => registration.id !== registrationId),
      );
      setExpandedRegistrationId((current) => (current === registrationId ? null : current));
      setMessage(data.message);
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete registration');
    } finally {
      setDeletingRegistrationId(null);
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setIsSubmitted(false);
    setMessage('');
    setError('');
  }

  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Future driver';
  const showcaseVehicle = vehicleOptions[showcaseIndex];
  const selectedRegistration = registrations.find(
    (registration) => registration.id === expandedRegistrationId,
  );

  return (
    <main ref={shellRef} className={`app-shell ${themeClass}`}>
      <div className="bg-grid" />
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="orb orb-three" />

      <section className="app-layout">
        <aside className="hero-panel">
          <div className="hero-content">
            <p className="eyebrow">Vehicle registration experience</p>
            <h1>Fast registration with live backend storage.</h1>
            <p className="hero-copy">
              The interface now persists every registration through an API, shows
              backend status, and displays the latest saved applications in real time.
            </p>

            <div className="vehicle-showcase">
              <div className="showcase-copy">
                <span className="detail-label">Vehicle spotlight</span>
                <strong>{showcaseVehicle.label}</strong>
                <p>Auto-rotating featured models for the registration experience.</p>
              </div>
              <div className="showcase-image-wrap">
                <img
                  className="showcase-image"
                  src={showcaseVehicle.image}
                  alt={showcaseVehicle.label}
                  referrerPolicy="no-referrer"
                />
              </div>
              <a
                className="showcase-credit"
                href={showcaseVehicle.creditHref}
                target="_blank"
                rel="noreferrer"
              >
                {showcaseVehicle.creditLabel}
              </a>
              <div className="showcase-dots">
                {vehicleOptions.map((vehicle, index) => (
                  <span
                    key={vehicle.value}
                    className={index === showcaseIndex ? 'showcase-dot active' : 'showcase-dot'}
                  />
                ))}
              </div>
            </div>

            <div ref={statRef} className="hero-stat">
              <span>Completion</span>
              <strong>{completion}%</strong>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="hero-tags">
              <span>{backendReady ? 'Backend connected' : 'Backend offline'}</span>
              <span>Express API</span>
              <span>Local persistence</span>
            </div>

            <div className="preview-card">
              <p className="preview-label">Registration preview</p>
              <h2>{fullName}</h2>
              <div className="preview-meta">
                <span>{formData.email || 'email pending'}</span>
                <span>{formData.phone || 'phone pending'}</span>
                <span>{formData.mode} Mode</span>
              </div>
              <div className="preview-vehicle">
                <span>Preferred vehicle</span>
                <strong>
                  {vehicleOptions.find((vehicle) => vehicle.value === formData.favCar)?.label}
                </strong>
              </div>
            </div>

            <div className="hero-details">
              <div className="detail-card">
                <span className="detail-label">Workflow</span>
                <strong>Form to API to MongoDB</strong>
                <p>
                  Every submission is validated in Express and stored in the database for
                  instant retrieval.
                </p>
              </div>
              <div className="detail-card">
                <span className="detail-label">Why this project works</span>
                <strong>Modern UI with real persistence</strong>
                <p>
                  Users can preview entries, submit cleanly, and review recent registrations
                  without leaving the page.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section ref={formRef} className="form-panel">
          <div className="panel-topbar">
            <div>
              <p className="panel-kicker">Full-stack application</p>
              <h2>Driver profile</h2>
            </div>

            <button
              type="button"
              className="theme-toggle"
              onClick={() => setIsDarkMode((current) => !current)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="toggle-thumb" />
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="field-grid">
              <label className="field-card">
                <span>First name</span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Aarav"
                  value={formData.firstName}
                  onChange={changeHandler}
                  required
                />
              </label>

              <label className="field-card">
                <span>Last name</span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Sharma"
                  value={formData.lastName}
                  onChange={changeHandler}
                  required
                />
              </label>

              <label className="field-card field-card-wide">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  placeholder="aarav@example.com"
                  value={formData.email}
                  onChange={changeHandler}
                  required
                />
              </label>

              <label className="field-card field-card-wide">
                <span>Phone number</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={changeHandler}
                  required
                />
              </label>

              <label className="field-card field-card-wide">
                <span>Notes</span>
                <textarea
                  name="comments"
                  rows="4"
                  placeholder="Add pickup notes, registration context, or preferred contact details."
                  value={formData.comments}
                  onChange={changeHandler}
                />
              </label>
            </div>

            <div className="option-row">
              <label className="switch-card">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={changeHandler}
                />
                <div>
                  <strong>Show profile in the system</strong>
                  <span>Keep this applicant discoverable for future follow-up.</span>
                </div>
              </label>

              <div className="mode-card">
                <p>Registration mode</p>
                <div className="mode-options">
                  <label>
                    <input
                      type="radio"
                      name="mode"
                      value="Online"
                      checked={formData.mode === 'Online'}
                      onChange={changeHandler}
                    />
                    <span>Online</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="mode"
                      value="Offline"
                      checked={formData.mode === 'Offline'}
                      onChange={changeHandler}
                    />
                    <span>Offline</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="vehicle-section">
              <p className="section-title">Choose a preferred vehicle</p>
              <div className="vehicle-grid">
                {vehicleOptions.map((vehicle) => (
                  <label key={vehicle.value} className="vehicle-card">
                    <input
                      type="radio"
                      name="favCar"
                      value={vehicle.value}
                      checked={formData.favCar === vehicle.value}
                      onChange={changeHandler}
                    />
                    <span className="vehicle-accent">{vehicle.accent}</span>
                    <strong>{vehicle.label}</strong>
                  </label>
                ))}
              </div>
            </div>

            {(message || error) && (
              <div className={`status-banner ${error ? 'status-error' : 'status-success'}`}>
                {error || message}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save registration'}
              </button>
              <button type="button" className="ghost-button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>

          <section ref={feedRef} className="backend-feed">
            <div className="summary-header">
              <div>
                <p className="panel-kicker">Saved in backend</p>
                <h3>Recent registrations</h3>
              </div>
              <span className="summary-badge">{registrations.length} records</span>
            </div>

            {registrations.length === 0 ? (
              <p className="empty-state">
                {backendReady
                  ? 'No registrations saved yet. Submit the form to create the first record.'
                  : 'Start the backend server to save and load registrations.'}
              </p>
            ) : (
              <div className="backend-grid">
                {registrations.slice(0, 4).map((registration) => (
                  <article key={registration.id} className="backend-card">
                    <span>{new Date(registration.createdAt).toLocaleString()}</span>
                    <strong>{`${registration.firstName} ${registration.lastName}`}</strong>
                    <p>{registration.email}</p>
                    <p>{registration.phone || 'No phone number'}</p>
                    <div className="backend-meta">
                      <span>{registration.mode}</span>
                      <span>
                        {vehicleOptions.find((vehicle) => vehicle.value === registration.favCar)
                          ?.label || registration.favCar}
                      </span>
                    </div>
                    <div className="backend-actions">
                      <button
                        type="button"
                        className="backend-toggle"
                        onClick={() => setExpandedRegistrationId(registration.id)}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        className="backend-delete"
                        disabled={deletingRegistrationId === registration.id}
                        onClick={() => handleDeleteRegistration(registration.id)}
                      >
                        {deletingRegistrationId === registration.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </section>

      {selectedRegistration && (
        <div
          className="details-modal-backdrop"
          onClick={() => setExpandedRegistrationId(null)}
          role="presentation"
        >
          <section
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-details-title"
          >
            <div className="details-modal-header">
              <div>
                <p className="panel-kicker">Registration details</p>
                <h3 id="registration-details-title">
                  {selectedRegistration.firstName} {selectedRegistration.lastName}
                </h3>
              </div>
              <button
                type="button"
                className="details-modal-close"
                onClick={() => setExpandedRegistrationId(null)}
              >
                Close
              </button>
            </div>

            <div className="backend-detail-grid details-modal-grid">
              <article>
                <span>Name</span>
                <strong>
                  {selectedRegistration.firstName} {selectedRegistration.lastName}
                </strong>
              </article>
              <article>
                <span>Email</span>
                <strong>{selectedRegistration.email}</strong>
              </article>
              <article>
                <span>Phone</span>
                <strong>{selectedRegistration.phone}</strong>
              </article>
              <article>
                <span>Mode</span>
                <strong>{selectedRegistration.mode}</strong>
              </article>
              <article>
                <span>Vehicle</span>
                <strong>
                  {vehicleOptions.find((vehicle) => vehicle.value === selectedRegistration.favCar)
                    ?.label || selectedRegistration.favCar}
                </strong>
              </article>
              <article>
                <span>Visibility</span>
                <strong>{selectedRegistration.isVisible ? 'Visible' : 'Private'}</strong>
              </article>
              <article>
                <span>Saved at</span>
                <strong>{new Date(selectedRegistration.createdAt).toLocaleString()}</strong>
              </article>
            </div>

            <div className="backend-notes details-modal-notes">
              <span>Notes</span>
              <p>{selectedRegistration.comments || 'No extra notes provided.'}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
