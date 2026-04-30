terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token             = var.do_token
  spaces_access_id  = var.spaces_access_id
  spaces_secret_key = var.spaces_secret_key
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
        repo           = "eduarevalo/vimmit-academic"
        branch         = "main"
        deploy_on_push = true
      }

      dockerfile_path = "backend/Dockerfile"
      source_dir      = "backend"

      # Environment Variables
      env {
        key   = "DATABASE_URL"
        value = "mysql://vimmit-academic:${var.db_password}@misnotasquilichao.com:6033/vimmit-academic"
        type  = "SECRET"
      }
      
      env {
        key   = "ENVIRONMENT"
        value = var.environment
      }

      env {
        key   = "ZEPTOMAIL_TOKEN"
        value = var.zeptomail_token
        type  = "SECRET"
      }

      env {
        key   = "ZEPTOMAIL_SMTP_USER"
        value = var.zeptomail_smtp_user
        type  = "SECRET"
      }

      env {
        key   = "SPACES_ACCESS_ID"
        value = var.spaces_access_id
        type  = "SECRET"
      }

      env {
        key   = "SPACES_SECRET_KEY"
        value = var.spaces_secret_key
        type  = "SECRET"
      }

      env {
        key   = "SPACES_BUCKET"
        value = digitalocean_spaces_bucket.attachments.name
      }

      env {
        key   = "SPACES_REGION"
        value = digitalocean_spaces_bucket.attachments.region
      }

      env {
        key   = "SPACES_ENDPOINT"
        value = "https://${digitalocean_spaces_bucket.attachments.region}.digitaloceanspaces.com"
      }
    }

    # Frontend Static Site
    static_site {
      name               = "frontend-web"
      # Order: unit tests → production build → install browser → E2E tests
      # DO aborts the deploy if any step exits non-zero.
      build_command      = "npm install && npm run test:coverage && npm run build && npx playwright install chromium --with-deps && CI=1 npm run test:bdd"
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

# Zoho Email Configuration
# ---------------------------------------------------------

# Zoho Domain Verification
resource "digitalocean_record" "zoho_verification" {
  domain = digitalocean_domain.default.id
  type   = "TXT"
  name   = "@"
  value  = "zoho-verification=zb85361907.zmverify.zoho.com"
}

# Zoho DKIM (Transactional)
resource "digitalocean_record" "zoho_dkim_transactional" {
  domain = digitalocean_domain.default.id
  type   = "TXT"
  name   = "291732328._domainkey"
  value  = "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDq6OIICyLJowSBxZVaVtfNgILw6Y0Rn49JA4ZSNKWhgA4aUT9zFKaM0xCUtDyWKRV1Ujujgtbh3HGYezZ3pE/FyAxGAoCiM3ZE6veJlTFW8tIaj6ATcD1G3F8GChUR0AUI/kyt3sB+p+WNDc4vVOhGERKx/sejDgeLVAtI0HPcvQIDAQAB"
}

# Zoho DKIM (Marketing)
resource "digitalocean_record" "zoho_dkim_marketing" {
  domain = digitalocean_domain.default.id
  type   = "TXT"
  name   = "zc919422121._domainkey"
  value  = "k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnOVNDqdCN2HCX+OJgkQQ5zhNmZFikLLZdwyGbOiXXO0tKkRucTTZpu3MG4iphYkY5rDCfWG/3A5fx72qHs8gPLPlRlAU4ZIFhmOhy26Y1fkISUUOcSbNdRywnehtTFC6CMBzzUAQgIvNQLHyWJ/MEn5FEJH04NIUeDsidCEGFy5DeUlgMkwwUFfS9XnL+4L1QZTQ9TK21xOVxZODw6HlOojgYR44J1DSGbrkxrDYflKb4kk1h02eEynEIwI4VF6LVEUGSiDUWtcJEORF+JA2VdsC4lZnxIt0HCRIqySiSrdjsbc/54tWxw4L1BtjmZHD1kjnS8ums2H7AoOiOoM56wIDAQAB"
}

# Zoho SPF Record (Merged)
resource "digitalocean_record" "zoho_spf" {
  domain = digitalocean_domain.default.id
  type   = "TXT"
  name   = "@"
  value  = "v=spf1 include:zohomail.com include:zoho.com ~all"
}

# Zoho MX Records
resource "digitalocean_record" "zoho_mx_1" {
  domain   = digitalocean_domain.default.id
  type     = "MX"
  name     = "@"
  priority = 10
  value    = "mx.zoho.com."
}

resource "digitalocean_record" "zoho_mx_2" {
  domain   = digitalocean_domain.default.id
  type     = "MX"
  name     = "@"
  priority = 20
  value    = "mx2.zoho.com."
}

resource "digitalocean_record" "zoho_mx_3" {
  domain   = digitalocean_domain.default.id
  type     = "MX"
  name     = "@"
  priority = 50
  value    = "mx3.zoho.com."
}

# Storage for Attachments
resource "digitalocean_spaces_bucket" "attachments" {
  name   = "vimmit-academic-attachments-${var.environment}"
  region = var.region
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
