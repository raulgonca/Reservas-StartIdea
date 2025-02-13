<?php

namespace App\Notifications;

use App\Models\Reserva;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class NuevaReservaNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reserva;

    public function __construct(Reserva $reserva)
    {
        $this->reserva = $reserva;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
{
    Log::debug('Iniciando preparación de correo', [
        'reserva_id' => $this->reserva->id,
        'smtp_config' => [
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'username' => config('mail.mailers.smtp.username'),
            'encryption' => config('mail.mailers.smtp.encryption')
        ],
        'to_email' => $notifiable->routes['mail'] ?? 'no_email_provided'
    ]);

    try {
        return (new MailMessage)
            ->subject('Nueva Reserva: ' . $this->reserva->espacio->nombre)
            ->greeting('¡Nueva Solicitud de Reserva!')
            ->line("Se ha recibido una nueva reserva de {$this->reserva->user->name}")
            ->line("• Espacio: {$this->reserva->espacio->nombre}")
            ->line("• Fecha: " . $this->reserva->fecha_inicio->format('d/m/Y'))
            ->line("• Tipo: " . ucfirst($this->reserva->tipo_reserva))
            ->action('Ver Detalles', url('/admin/reservas'))
            ->line('Por favor, revisa y actualiza el estado de la reserva.');

        Log::debug('Correo preparado exitosamente', [
            'reserva_id' => $this->reserva->id
        ]);

    } catch (\Exception $e) {
        Log::error('Error preparando el correo', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}







}