import { ComponenteMenu } from './componente-menu.enum';
import { Menu } from './menu';
import { Sugerencia } from './sugerencia';

export class MenuSugerencia {
    id: number;
    menu: Menu;
    sugerencia: Sugerencia;
    // primerPlato: boolean;
    componenteMenu: ComponenteMenu;
}
