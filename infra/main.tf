terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_app" "vimmit_academic" {
  spec {
    name   = var.app_name
    region = var.region

    # Backend Service (Containerized)
    service {
      name               = "backend-api"
      instance_count     = 1
      instance_size_slug = "basic-xxs" # $5/month

      image {
        registry_type = "DOCR" # Or use github source if preferred
        repository    = "backend" # This will be built by DO if configured
      }

      # Alternatively, build from source using Dockerfile
      # github {
      #   repo           = "eduarevalo/vimmit-academic"
      #   branch         = "main"
      #   dockerfile_path = "backend/Dockerfile"
      # }

      source_dir = "backend"
      dockerfile_path = "Dockerfile"

      # Environment Variables
      env {
        key   = "DATABASE_URL"
        value = "sqlite:///test.db" # Replace with a real DB later
        type  = "SECRET"
      }
      
      env {
        key   = "ENVIRONMENT"
        value = var.environment
      }
    }

    # Frontend Static Site
    static_site {
      name               = "frontend-web"
      build_command      = "npm install && npm run build"
      output_dir         = "dist"
      source_dir         = "frontend"
      
      github {
        repo   = "eduarevalo/vimmit-academic"
        branch = "main"
      }
    }
  }
}
