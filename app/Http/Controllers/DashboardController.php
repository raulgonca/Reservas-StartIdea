<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\DashboardStatService;

class DashboardController extends Controller
{
    protected $dashboardStatService;

    public function __construct(DashboardStatService $dashboardStatService)
    {
        $this->dashboardStatService = $dashboardStatService;
    }

    public function index()
    {
        $dashboardData = $this->dashboardStatService->getAllStats();
        
        return Inertia::render('Dashboard', $dashboardData);
    }
}
