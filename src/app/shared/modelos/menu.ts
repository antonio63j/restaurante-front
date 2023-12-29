import { MenuSugerencia } from './menu-sugerencia';

export class Menu {
    id: number;
    label: string;
    precio: number;
    visible: boolean;
    descripcion: string;
    imgFileName: string;
    precioAnterior: number;
    menuSugerencias: MenuSugerencia[] = [];
}
