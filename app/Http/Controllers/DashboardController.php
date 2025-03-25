<?php

namespace App\Http\Controllers;

use App\Services\DashboardStatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardStatsService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $data = [
            'stats' => $this->dashboardService->getUserStats($user->id),
            'chartData' => $this->dashboardService->getUserChartData($user->id),
            'proximasReservas' => $this->dashboardService->getProximasReservas($user->id),
            'historialReservas' => $this->dashboardService->getHistorialReservas($user->id)
        ];
    
        // Add admin stats if user is admin or superadmin
        if (in_array($user->role, ['admin', 'superadmin'])) {
            $data['adminStats'] = $this->dashboardService->getAdminStats();
            $data['adminChartData'] = $this->dashboardService->getAdminChartData();
        }
    
        // Add superadmin stats if user is superadmin
        if ($user->role === 'superadmin') {
            $data['superAdminStats'] = $this->dashboardService->getSuperAdminStats();
        }
    
        return Inertia::render('Dashboard', $data);
    }
}
