import React from "react";
import { useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import "./DoctorCard.css";

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  if (!doctor) return null;

  const { _id, profile = {}, rating = 0, reviewCount = 0 } = doctor;
  const name = profile.name || "Doctor";
  const specialty = profile.specialty || "General";
  const experience = profile.experience || 0;
  const avatar = profile.avatar;

  const handleBook = () => {
    navigate(`/appointments/book?doctorId=${_id}`);
  };

  return (
    <div className="doctor-card">
      <div className="doctor-card__header">
        <div className="doctor-card__avatar" aria-hidden="true">
          {avatar ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={avatar} alt={`${name} avatar`} />
          ) : (
            name.charAt(0)
          )}
        </div>
      </div>

      <div className="doctor-card__body">
        <h3 className="doctor-card__name">{name}</h3>
        <p className="doctor-card__specialty">{specialty}</p>
        <p className="doctor-card__experience">{experience} years experience</p>

        <p className="doctor-card__rating">
          <span className="doctor-card__rating-value"><FiStar size={16} aria-hidden /> {rating?.toFixed ? rating.toFixed(1) : rating}/5</span>
          <span className="doctor-card__rating-count">({reviewCount} reviews)</span>
        </p>
      </div>

      <div className="doctor-card__actions">
        <button type="button" onClick={handleBook} className="doctor-card__btn doctor-card__btn--primary">
          Book consultation
        </button>
      </div>
    </div>
  );
}

