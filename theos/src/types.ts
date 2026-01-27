export interface AppConfig {
  id: string;
  
  name: string;
  
  icon: string; // Ruta de la imagen o clase de FontAwesome
  
  isOpen: boolean;
  
  isMinimized: boolean;
  
  isFocused: boolean;
  
  zIndex: number;
  
  position: {
    x: number;
    y: number;
  };
  
  size: {
    width: number;
    height: number;
  };
  
  minSize?: { 
    width: number; 
    height: number 
  };
  
  maxSize?: { 
    width: number; 
    height: number };
  
  isMaximized: boolean;
  
  tempSettings?: {
    position: {
      x:number;
      y:number;
    };
    
    size: {
      width: number;
      height: number;
    };
  }
}