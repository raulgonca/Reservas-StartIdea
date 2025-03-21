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
        $data = [];

        switch ($user->role) {
            case 'superadmin':
                $data['stats'] = $this->dashboardService->getSuperAdminStats();
                $data['chartData'] = $this->dashboardService->getAdminChartData();
                return Inertia::render('SuperAdmin/SuperAdminDashboard', $data);

            case 'admin':
                $data['stats'] = $this->dashboardService->getAdminStats();
                $data['chartData'] = $this->dashboardService->getAdminChartData();
                return Inertia::render('Admin/AdminDashboard', $data);

            default:
                $data['stats'] = $this->dashboardService->getUserStats($user->id);
                $data['chartData'] = $this->dashboardService->getUserChartData($user->id);
                return Inertia::render('Dashboard', $data);
        }
    }
}
