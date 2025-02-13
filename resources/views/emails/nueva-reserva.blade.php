<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nueva Reserva</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .details {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Nueva Solicitud de Reserva!</h1>
    </div>

    <div class="details">
        <p>Se ha recibido una nueva solicitud de reserva con los siguientes detalles:</p>
        
        <ul>
            <li><strong>Usuario:</strong> {{ $reserva->user->name }}</li>
            <li><strong>Email:</strong> {{ $reserva->user->email }}</li>
            <li><strong>Espacio:</strong> {{ $reserva->espacio->nombre }}</li>
            @if($reserva->escritorio_id)
                <li><strong>Escritorio:</strong> {{ $reserva->escritorio->nombre }}</li>
            @endif
            <li><strong>Fecha:</strong> {{ $reserva->fecha_inicio->format('d/m/Y') }}</li>
            @if(in_array($reserva->tipo_reserva, ['hora', 'medio_dia']))
                <li><strong>Hora:</strong> {{ $reserva->hora_inicio }}
                    @if($reserva->hora_fin)
                        a {{ $reserva->hora_fin }}
                    @endif
                </li>
            @endif
            <li><strong>Tipo:</strong> {{ ucfirst($reserva->tipo_reserva) }}</li>
            @if($reserva->motivo)
                <li><strong>Motivo:</strong> {{ $reserva->motivo }}</li>
            @endif
        </ul>

        <p>Por favor, revisa los detalles y actualiza el estado de la reserva según corresponda.</p>
    </div>

    <div class="footer">
        <p>Este es un mensaje automático del Sistema de Reservas.</p>
    </div>
</body>
</html>