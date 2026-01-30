// src/features/appointments/DoctorList.jsx
import React, { useState, useEffect } from "react";
import { MdMedicalServices } from "react-icons/md";
import api from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import LoadingSpinner from "../../components/feedback/LoadingSpinner";
import EmptyState from "../../components/feedback/EmptyState";
import DoctorCard from "../../components/data-display/DoctorCard";
import "./DoctorList.css";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setError("");
        const { data } = await api.get("/auth/doctors", {
          params: specialty ? { specialty } : {},
        });
        const list = data?.data?.data || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Doctors fetch failed", err);
        setError(err?.response?.data?.message || "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specialty]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Finding doctors near you..." />;
  }

  return (
    <div className="doctors-page">
      <PageHeader
        title="Find a Doctor"
        subtitle="Search for specialists and book an online consultation."
      />

      <div className="doctors-page__controls">
        <label className="doctors-page__filter">
          Specialty
          <select
            onChange={(e) => setSpecialty(e.target.value)}
            value={specialty}
          >
            <option value="">All specialties</option>
            <option value="General">General</option>
            <option value="Neurology">Neurology</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Orthology">Orthology</option>
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      {doctors.length === 0 ? (
        <EmptyState
          icon={<MdMedicalServices size={48} />}
          title="No doctors match your filters"
          description="Try removing some filters or check back later for new specialists."
        />
      ) : (
        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
