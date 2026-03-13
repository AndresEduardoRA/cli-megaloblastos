import StudyRoomBooking from "@/components/StudyRoomBooking";
import ServiceAccessGuard from "@/components/ServiceAccessGuard";

export default function Page() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-white mb-4">
          Reserva de Sala de Estudio
        </h1>

        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Horarios disponibles para el día de hoy.
        </p>
      </div>

      <ServiceAccessGuard serviceName="sala de estudio">
        <StudyRoomBooking />
      </ServiceAccessGuard>
    </section>
  );
}
