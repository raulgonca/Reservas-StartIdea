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
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .section {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .section-title {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .detail-item {
            padding: 5px 0;
        }
        .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-weight: bold;
        }
        .status-pendiente { background-color: #fef3c7; color: #92400e; }
        .status-confirmada { background-color: #dcfce7; color: #166534; }
        .status-cancelada { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Nueva Solicitud de Reserva!</h1>
        <p>ID de Reserva: #{{ $reserva->id }}</p>
    </div>

    <div class="section">
        <h2 class="section-title">Datos del Usuario</h2>
        <div class="details-grid">
            <div class="detail-item"><strong>Nombre:</strong> {{ $reserva->user->name }}</div>
            <div class="detail-item"><strong>Email:</strong> {{ $reserva->user->email }}</div>
            <div class="detail-item"><strong>DNI:</strong> {{ $reserva->user->dni }}</div>
            <div class="detail-item"><strong>Teléfono:</strong> {{ $reserva->user->phone }}</div>
            <div class="detail-item"><strong>Rol:</strong> {{ ucfirst($reserva->user->role) }}</div>
            <div class="detail-item"><strong>Fecha de registro:</strong> {{ $reserva->user->created_at->format('d/m/Y') }}</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Detalles de la Reserva</h2>
        <div class="details-grid">
            <div class="detail-item"><strong>Estado:</strong> 
                <span class="status status-{{ $reserva->estado }}">
                    {{ ucfirst($reserva->estado) }}
                </span>
            </div>
            <div class="detail-item"><strong>Tipo de Reserva:</strong> {{ ucfirst($reserva->tipo_reserva) }}</div>
            <div class="detail-item"><strong>Espacio:</strong> {{ $reserva->espacio->nombre }}</div>
            <div class="detail-item"><strong>Tipo de Espacio:</strong> {{ ucfirst($reserva->espacio->tipo) }}</div>
            @if($reserva->escritorio_id)
                <div class="detail-item"><strong>Escritorio:</strong> {{ $reserva->escritorio->nombre }}</div>
            @endif
            <div class="detail-item"><strong>Fecha de Inicio:</strong> {{ $reserva->fecha_inicio->format('d/m/Y') }}</div>
            <div class="detail-item"><strong>Fecha de Fin:</strong> {{ $reserva->fecha_fin->format('d/m/Y') }}</div>
            @if(in_array($reserva->tipo_reserva, ['hora', 'medio_dia']))
                <div class="detail-item"><strong>Hora de Inicio:</strong> {{ $reserva->hora_inicio }}</div>
                <div class="detail-item"><strong>Hora de Fin:</strong> {{ $reserva->hora_fin }}</div>
            @endif
            @if($reserva->motivo)
                <div class="detail-item" style="grid-column: 1 / -1"><strong>Motivo:</strong> {{ $reserva->motivo }}</div>
            @endif
            <div class="detail-item"><strong>Creada el:</strong> {{ $reserva->created_at->format('d/m/Y H:i:s') }}</div>
            <div class="detail-item"><strong>Última actualización:</strong> {{ $reserva->updated_at->format('d/m/Y H:i:s') }}</div>
        </div>
    </div>

    <div class="section">
        <p><strong>Nota:</strong> Por favor, revisa los detalles y actualiza el estado de la reserva según corresponda.</p>
        <p>Puedes gestionar esta reserva desde el panel de administración.</p>
    </div>

    <div class="footer">
        <p>Este es un mensaje automático del Sistema de Reservas.</p>
        <p>© {{ date('Y') }} Sistema de Reservas - Todos los derechos reservados</p>
    </div>
</body>
</html>