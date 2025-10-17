import { Service } from "src/entities/service.entity";

export interface ServiceWithStats {
  service: Service;
  totalReservations: number;
  totalGarages: number;
}
