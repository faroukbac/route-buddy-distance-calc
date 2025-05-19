
export interface Location {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface LocationsFile {
  locations: Location[];
}
