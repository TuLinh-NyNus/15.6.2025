# NyNus Docker Setup Test Script
# Tests Docker configuration and services

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "both")]
    [string]$Environment = "dev"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Cyan = "`e[36m"
$Reset = "`e[0m"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = $Reset)
    Write-Host "$Color$Message$Reset"
}

function Test-DockerInstallation {
    Write-ColorOutput "🔍 Testing Docker installation..." $Blue
    
    try {
        $dockerVersion = docker --version
        Write-ColorOutput "✅ Docker: $dockerVersion" $Green
    } catch {
        Write-ColorOutput "❌ Docker not installed or not running" $Red
        return $false
    }
    
    try {
        $composeVersion = docker-compose --version
        Write-ColorOutput "✅ Docker Compose: $composeVersion" $Green
    } catch {
        Write-ColorOutput "❌ Docker Compose not installed" $Red
        return $false
    }
    
    return $true
}

function Test-DockerFiles {
    Write-ColorOutput "🔍 Testing Docker configuration files..." $Blue
    
    $files = @(
        "docker-compose.yml",
        "docker-compose.dev.yml", 
        ".env.docker",
        ".env.dev",
        ".dockerignore",
        "apps/web/Dockerfile",
        "apps/web/Dockerfile.dev",
        "apps/api/Dockerfile",
        "apps/api/Dockerfile.dev"
    )
    
    $allExist = $true
    foreach ($file in $files) {
        if (Test-Path $file) {
            Write-ColorOutput "✅ $file exists" $Green
        } else {
            Write-ColorOutput "❌ $file missing" $Red
            $allExist = $false
        }
    }
    
    return $allExist
}

function Test-BuildImages {
    param([string]$ComposeFile, [string]$EnvFile)
    
    Write-ColorOutput "🔨 Testing image builds..." $Blue
    
    try {
        Write-ColorOutput "Building images..." $Yellow
        $result = docker-compose -f $ComposeFile --env-file $EnvFile build 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Images built successfully" $Green
            return $true
        } else {
            Write-ColorOutput "❌ Build failed:" $Red
            Write-ColorOutput $result $Red
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Build error: $_" $Red
        return $false
    }
}

function Test-ServiceStartup {
    param([string]$ComposeFile, [string]$EnvFile)
    
    Write-ColorOutput "🚀 Testing service startup..." $Blue
    
    try {
        # Start services
        Write-ColorOutput "Starting services..." $Yellow
        docker-compose -f $ComposeFile --env-file $EnvFile up -d
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Failed to start services" $Red
            return $false
        }
        
        # Wait for services to be ready
        Write-ColorOutput "Waiting for services to be ready..." $Yellow
        Start-Sleep -Seconds 30
        
        # Check service status
        $services = docker-compose -f $ComposeFile ps --format json | ConvertFrom-Json
        $allHealthy = $true
        
        foreach ($service in $services) {
            $status = $service.State
            if ($status -eq "running") {
                Write-ColorOutput "✅ $($service.Service): $status" $Green
            } else {
                Write-ColorOutput "❌ $($service.Service): $status" $Red
                $allHealthy = $false
            }
        }
        
        return $allHealthy
    } catch {
        Write-ColorOutput "❌ Startup error: $_" $Red
        return $false
    }
}

function Test-HealthChecks {
    Write-ColorOutput "🏥 Testing health checks..." $Blue
    
    $endpoints = @(
        @{ Name = "Web Health"; Url = "http://localhost:3000/api/health" },
        @{ Name = "API Health"; Url = "http://localhost:5000/health" }
    )
    
    $allHealthy = $true
    foreach ($endpoint in $endpoints) {
        try {
            Write-ColorOutput "Checking $($endpoint.Name)..." $Yellow
            $response = Invoke-RestMethod -Uri $endpoint.Url -TimeoutSec 10
            
            if ($response.status -eq "ok") {
                Write-ColorOutput "✅ $($endpoint.Name): OK" $Green
            } else {
                Write-ColorOutput "❌ $($endpoint.Name): $($response.status)" $Red
                $allHealthy = $false
            }
        } catch {
            Write-ColorOutput "❌ $($endpoint.Name): Failed to connect" $Red
            $allHealthy = $false
        }
    }
    
    return $allHealthy
}

function Test-DatabaseConnection {
    Write-ColorOutput "🗄️  Testing database connection..." $Blue
    
    try {
        $result = docker exec nynus_db_dev pg_isready -U postgres -d nynus_db 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Database connection: OK" $Green
            return $true
        } else {
            Write-ColorOutput "❌ Database connection failed: $result" $Red
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Database test error: $_" $Red
        return $false
    }
}

function Test-RedisConnection {
    Write-ColorOutput "🔴 Testing Redis connection..." $Blue
    
    try {
        $result = docker exec nynus_redis_dev redis-cli ping 2>&1
        if ($result -eq "PONG") {
            Write-ColorOutput "✅ Redis connection: OK" $Green
            return $true
        } else {
            Write-ColorOutput "❌ Redis connection failed: $result" $Red
            return $false
        }
    } catch {
        Write-ColorOutput "❌ Redis test error: $_" $Red
        return $false
    }
}

function Cleanup-TestEnvironment {
    param([string]$ComposeFile)
    
    Write-ColorOutput "🧹 Cleaning up test environment..." $Yellow
    docker-compose -f $ComposeFile down -v --remove-orphans 2>&1 | Out-Null
}

function Run-FullTest {
    param([string]$EnvType)
    
    Write-ColorOutput "🧪 Running full test for $EnvType environment..." $Cyan
    Write-ColorOutput "=" * 50 $Cyan
    
    $composeFile = if ($EnvType -eq "dev") { "docker-compose.dev.yml" } else { "docker-compose.yml" }
    $envFile = if ($EnvType -eq "dev") { ".env.dev" } else { ".env.docker" }
    
    $testResults = @()
    
    # Test builds
    $buildResult = Test-BuildImages $composeFile $envFile
    $testResults += @{ Test = "Build Images"; Result = $buildResult }
    
    if ($buildResult) {
        # Test startup
        $startupResult = Test-ServiceStartup $composeFile $envFile
        $testResults += @{ Test = "Service Startup"; Result = $startupResult }
        
        if ($startupResult) {
            # Test health checks
            $healthResult = Test-HealthChecks
            $testResults += @{ Test = "Health Checks"; Result = $healthResult }
            
            # Test database
            $dbResult = Test-DatabaseConnection
            $testResults += @{ Test = "Database Connection"; Result = $dbResult }
            
            # Test Redis
            $redisResult = Test-RedisConnection
            $testResults += @{ Test = "Redis Connection"; Result = $redisResult }
        }
        
        # Cleanup
        Cleanup-TestEnvironment $composeFile
    }
    
    # Summary
    Write-ColorOutput "`n📊 Test Summary for $EnvType:" $Cyan
    $passedTests = 0
    foreach ($test in $testResults) {
        $status = if ($test.Result) { "✅ PASS" } else { "❌ FAIL" }
        $color = if ($test.Result) { $Green } else { $Red }
        Write-ColorOutput "  $($test.Test): $status" $color
        if ($test.Result) { $passedTests++ }
    }
    
    $totalTests = $testResults.Count
    Write-ColorOutput "`nResult: $passedTests/$totalTests tests passed" $(if ($passedTests -eq $totalTests) { $Green } else { $Red })
    
    return $passedTests -eq $totalTests
}

# Main execution
Write-ColorOutput "🐳 NyNus Docker Setup Test" $Cyan
Write-ColorOutput "=========================" $Cyan

# Test Docker installation
if (-not (Test-DockerInstallation)) {
    Write-ColorOutput "❌ Docker installation test failed. Please install Docker and Docker Compose." $Red
    exit 1
}

# Test configuration files
if (-not (Test-DockerFiles)) {
    Write-ColorOutput "❌ Configuration files test failed. Please ensure all Docker files exist." $Red
    exit 1
}

# Run environment tests
$allPassed = $true

if ($Environment -eq "dev" -or $Environment -eq "both") {
    $devResult = Run-FullTest "dev"
    $allPassed = $allPassed -and $devResult
}

if ($Environment -eq "prod" -or $Environment -eq "both") {
    $prodResult = Run-FullTest "prod"
    $allPassed = $allPassed -and $prodResult
}

# Final result
Write-ColorOutput "`n🎯 Overall Result:" $Cyan
if ($allPassed) {
    Write-ColorOutput "✅ All tests passed! Docker setup is working correctly." $Green
    exit 0
} else {
    Write-ColorOutput "❌ Some tests failed. Please check the output above." $Red
    exit 1
}
