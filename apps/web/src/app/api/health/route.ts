import { NextRequest, NextResponse } from 'next/server';

interface HealthData {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  api?: {
    status: string;
    apiStatus?: string;
    apiVersion?: string;
    message?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const healthData: HealthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'nynus-web',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };

    // Optional: Check API connectivity
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        const apiResponse = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(5000),
        });
        
        if (apiResponse.ok) {
          const apiHealth = await apiResponse.json();
          healthData.api = {
            status: 'connected',
            apiStatus: apiHealth.status,
            apiVersion: apiHealth.version,
          };
        } else {
          healthData.api = {
            status: 'error',
            message: `API returned ${apiResponse.status}`,
          };
        }
      } catch (apiError) {
        healthData.api = {
          status: 'disconnected',
          message: apiError instanceof Error ? apiError.message : 'Unknown API error',
        };
      }
    }

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    const errorData = {
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'nynus-web',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorData, { status: 500 });
  }
}
