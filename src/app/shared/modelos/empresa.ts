
export class DiaDescansoOpciones {
    static dias: string [] = [
        'indefinido',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo'
        ];
  }

export class Empresa {
    id: number;
    nombre: string;
    telefono: string;
    direccion: string;
    provincia: string;
    email: string;
    urlWeb: string;
    descripcionBreve: string;
    // horario: string;
    portada: string;
    horaApertura: string;
    horaCierre: string;
    diasDescanso: string[];
    horasMinPreparacionPedido: number;
    diasMaxEntregaPedido: number;

}
