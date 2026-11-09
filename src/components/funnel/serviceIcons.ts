import type { ServiceId } from "@/lib/services";
import {
  HouseIcon,
  KeyIcon,
  OfficeIcon,
  RenovationIcon,
  SofaIcon,
  WindowIcon,
  type IconComponent,
} from "../icons";

export const serviceIcons: Record<ServiceId, IconComponent> = {
  domestica: HouseIcon,
  escritorios: OfficeIcon,
  posobra: RenovationIcon,
  vidros: WindowIcon,
  estofos: SofaIcon,
  alojamento: KeyIcon,
};
