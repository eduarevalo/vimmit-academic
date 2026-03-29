import httpx
import os
import jinja2
from typing import Dict, Any, Optional, List
from jinja2 import Environment, FileSystemLoader

from infrastructure.config.settings import get_settings

class EmailService:
    def __init__(self):
        settings = get_settings()
        self.token = settings.ZEPTOMAIL_TOKEN
        self.sender_email = settings.AUTHORIZED_SENDER_EMAIL
        self.sender_name = settings.AUTHORIZED_SENDER_NAME
        self.api_url = settings.ZEPTOMAIL_API_URL
        
        # Setup Jinja2 for templates
        template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))

    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        template_name: str, 
        context: Dict[str, Any],
        tenant_slug: str = "default"
    ) -> bool:
        """
        Sends an email using ZeptoMail API.
        Attempts to load a tenant-specific template, falling back to default.
        """
        if not self.token:
            print("WARNING: ZEPTOMAIL_TOKEN not found. Email not sent.")
            return False

        # Try to load tenant template: tenants/{slug}/{template_name}
        # Fallback: tenants/default/{template_name}
        try:
            template_path = f"tenants/{tenant_slug}/{template_name}"
            # Check if template exists for tenant
            try:
                template = self.jinja_env.get_template(template_path)
            except jinja2.TemplateNotFound:
                template_path = f"tenants/default/{template_name}"
                template = self.jinja_env.get_template(template_path)
            
            html_content = template.render(**context)
        except Exception as e:
            print(f"Error rendering email template: {e}")
            return False

        payload = {
            "from": {"address": self.sender_email, "name": self.sender_name},
            "to": [{"email_address": {"address": to_email}}],
            "subject": subject,
            "htmlbody": html_content
        }

        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": self.token
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                return True
            except httpx.HTTPStatusError as e:
                print(f"ZeptoMail API error: {e.response.text}")
                return False
            except Exception as e:
                print(f"Error sending email through ZeptoMail: {e}")
                return False

    async def send_password_reset(self, to_email: str, reset_link: str, tenant_slug: str = "default"):
        return await self.send_email(
            to_email=to_email,
            subject="Restablece tu contraseña - Vimmit Academic",
            template_name="forgot_password.html",
            context={"reset_link": reset_link, "email": to_email},
            tenant_slug=tenant_slug
        )
