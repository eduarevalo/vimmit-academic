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

    domain {
      name = "www.aseder.edu.co"
      type = "PRIMARY"
    }

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
        value = "sqlite:///test.db"
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
      error_document     = "index.html"
      
      github {
        repo           = "eduarevalo/vimmit-academic"
        branch         = "main"
        deploy_on_push = true
      }

      env {
        key   = "VITE_API_URL"
        value = "/api"
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

# DNS Management for aseder.edu.co
resource "digitalocean_domain" "default" {
  name = var.custom_domain
}

# ZeptoMail DKIM Record
resource "digitalocean_record" "zeptomail_dkim" {
  domain = digitalocean_domain.default.id
  type   = "TXT"
  name   = "29162140._domainkey"
  value  = "k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm4UxnQ2AfyjHT7MKZCe9Du9RQWePTQaUEu6OTw33FoW1/owl3HHHGoHn41Z85KAPDXuahiD97uuT4yLrXw9YeVNsxGcW01zBgR40T1OT4BcIDqRSJ8IXYbIhwODWw7KjVg3JhJQ6v2+UmjG0jUIYX5UXayb42MgHBrWO6g7qkba+e7dVL6xb8bVZATdvTPaK5KjAsoZTBM3IWaOPTmG1L0TFaKN/lx2EB5SvvtuxTRHNJzDGu82yDMyvlPEWklKscy3mQTLID89tyzz+bNjrDdu+O1vKvG6l/yhTCuKyjolXzIzinqKIotTV9UnrMe1xgd6ggKzRdorfsPneivrKpwIDAQAB"
}

# ZeptoMail CNAME for bounce/tracking
resource "digitalocean_record" "zeptomail_cname" {
  domain = digitalocean_domain.default.id
  type   = "CNAME"
  name   = "bounce-zem"
  value  = "cluster89.zeptomail.com."
}
