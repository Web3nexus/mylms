<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // Redirect direct browser visits to the backend to the frontend Vite server
    return redirect('http://localhost:5174');
});
