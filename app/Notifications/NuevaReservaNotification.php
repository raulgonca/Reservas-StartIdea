<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Clase para manejar notificaciones de nuevas reservas
 * 
 * Esta clase se encarga de enviar notificaciones por email cuando se crea una nueva reserva.
 * Implementa ShouldQueue para procesar las notificaciones de forma asíncrona y mejorar el rendimiento.
 * 
 * @package App\Notifications
 */
class NuevaReservaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * La reserva que se está notificando
     * 
     * @var \App\Models\Reserva
     */
    protected $reserva;

    /**
     * Crea una nueva instancia de la notificación
     * 
     * @param \App\Models\Reserva $reserva La reserva que se va a notificar
     * @return void
     */
    public function __construct(Reserva $reserva)
    {
        $this->reserva = $reserva;
    }

    /**
     * Determina los canales por los que se enviará la notificación
     * 
     * @param mixed $notifiable El modelo que recibe la notificación
     * @return array Los canales a utilizar
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construye el mensaje de correo electrónico
     * 
     * Genera un email con todos los detalles relevantes de la reserva y el usuario
     * para que el administrador pueda gestionarla y contactar al solicitante.
     * 
     * @param mixed $notifiable El modelo que recibe la notificación
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            // Asunto del correo con el nombre del espacio
            ->subject('Nueva Solicitud de Reserva - ' . $this->reserva->espacio->nombre)
            // Saludo inicial
            ->greeting('¡Nueva solicitud de reserva!')
            // Mensaje introductorio
            ->line('Se ha recibido una nueva solicitud de reserva que requiere revisión.')
            
            // Información del solicitante
            ->line('Detalles del solicitante:')
            ->line('Nombre: ' . $this->reserva->user->name)
            ->line('Email: ' . $this->reserva->user->email)
            ->line('Teléfono: ' . $this->reserva->user->phone)
            
            // Detalles de la reserva
            ->line('Detalles de la reserva:')
            ->line('Espacio: ' . $this->reserva->espacio->nombre)
            ->line('Tipo: ' . $this->reserva->tipo_reserva)
            ->line('Fecha Inicio: ' . $this->reserva->fecha_inicio)
            ->line('Fecha Fin: ' . $this->reserva->fecha_fin)
            
            // Botón de acción para ver la reserva en el sistema
            ->action('Ver en el sistema', url('/admin/reservas'))
            
            // Instrucciones finales
            ->line('Por favor, revise la solicitud en el sistema y contacte al usuario para coordinar el pago.');
    }
}