<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class TestMailCommand extends Command
{
    /**
     * El nombre y firma del comando.
     *
     * @var string
     */
    protected $signature = 'mail:test';

    /**
     * La descripción del comando.
     *
     * @var string
     */
    protected $description = 'Envía un correo de prueba para verificar la configuración';

    /**
     * Ejecuta el comando de prueba.
     */
    public function handle()
    {
        $this->info('Enviando correo de prueba...');

        try {
            // Intenta enviar el correo
            Mail::raw('Prueba de configuración de correo desde Laravel', function (Message $message) {
                $message->to(config('reservas.notification_email'))
                        ->subject('Test de Configuración de Correo');
            });

            // Si el envío es exitoso
            $this->info('¡Correo enviado correctamente! Verifica tu bandeja en Mailtrap.');
            
        } catch (\Exception $e) {
            // Si hay algún error
            $this->error('Error al enviar el correo: ' . $e->getMessage());
        }
    }
}