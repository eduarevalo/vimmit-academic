variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean Region"
  type        = string
  default     = "nyc3"
}

variable "app_name" {
  description = "App Platform Name"
  type        = string
  default     = "vimmit-academic"
}

variable "environment" {
  description = "Deployment Environment"
  type        = string
  default     = "production"
}
