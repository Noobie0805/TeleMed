import React from "react";
import "./AppointmentLargeComponent.css";
import ConsultHeader from "./ConsultHeader/ConsultHeader";
import ConsultVideoPanel from "./ConsultVideoPanel/ConsultVideoPanel";
import ConsultSidePanel from "./ConsultSidePanel/ConsultSidePanel";

const AppointmentLargeComponent = () => {
    const patient = { name: "John Doe", age: 32, id: "P-12345" };
    const doctor = { name: "Dr. Ananya Sharma", speciality: "Cardiology" };

    return (
        <div className="AppointmentLarge_box">
            <div className="Consult_header">
                <ConsultHeader patient={patient} doctor={doctor} />
            </div>

            <div className="Consult_body">
                <div className="Consult_videoPane">
                    <ConsultVideoPanel />
                </div>

                <div className="Consult_sidePane">
                    <ConsultSidePanel patient={patient} doctor={doctor} />
                </div>
            </div>
        </div>
    );
};

export default AppointmentLargeComponent;
