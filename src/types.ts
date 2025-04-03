// Define the DraggableImage interface with all properties
export interface DraggableImage {
    id: number;
    name: string;
    src: string;
    x: number;
    y: number;
    type: string;
    coordinates: string;
    power_on: boolean;
    interface: InterfaceDetails;
  }
  
  // Define the InterfaceDetails interface for the interface property
  export interface InterfaceDetails {
    name: string;
    ip: string;
    bandwidth: number;
  }
  
  // Define the Link interface
  export interface Link {
    from: number;
    to: number;
  }