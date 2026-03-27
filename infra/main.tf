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
      http_port          = 8080

      github {
        repo   = "eduarevalo/vimmit-academic"
        branch = "main"
      }

      dockerfile_path = "backend/Dockerfile"
      source_dir      = "backend"

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
      
      env {
        key   = "SOURCE_COMMIT_SHA"
        value = var.backend_sha
      }
    }

    # Frontend Static Site
    static_site {
      name               = "frontend-web"
      build_command      = "npm install && npm run build # SHA: ${var.frontend_sha}"
      output_dir         = "dist"
      source_dir         = "frontend"
      error_document     = "index.html"
      
      github {
        repo   = "eduarevalo/vimmit-academic"
        branch = "main"
      }

      env {
        key   = "SOURCE_COMMIT_SHA"
        value = var.frontend_sha
      }
    }

    # Central Ingress Routing (Fixes deprecation warning)
    ingress {
      rule {
        component {
          name = "backend-api"
        }
        match {
          path {
            prefix = "/api"
          }
        }
      }
      rule {
        component {
          name = "frontend-web"
        }
        match {
          path {
            prefix = "/"
          }
        }
      }
    }
  }
}
