import smtplib
import anyio
import os
import jinja2
from email.message import EmailMessage
from typing import Dict, Any, Optional, List
from jinja2 import Environment, FileSystemLoader

from infrastructure.config.settings import get_settings

class EmailService:
    def __init__(self):
        settings = get_settings()
        self.token = settings.ZEPTOMAIL_TOKEN
        self.sender_email = settings.AUTHORIZED_SENDER_EMAIL
        self.sender_name = settings.AUTHORIZED_SENDER_NAME
        self.smtp_host = settings.ZEPTOMAIL_SMTP_HOST
        self.smtp_port = settings.ZEPTOMAIL_SMTP_PORT
        self.smtp_user = settings.ZEPTOMAIL_SMTP_USER
        
        # Setup Jinja2 for templates
        template_dir = os.path.join(os.path.dirname(__file__), "..", "templates")
        self.jinja_env = Environment(loader=FileSystemLoader(template_dir))

    async def send_email(
        self, 
        to_email: str, 
        template_name: str, 
        context: Dict[str, Any],
        subject: Optional[str] = None,
        tenant_slug: str = "default"
    ) -> bool:
        """
        Sends an email using ZeptoMail SMTP.
        Attempts to load a tenant-specific template, falling back to default.
        """
        if not self.token:
            print("WARNING: ZEPTOMAIL_TOKEN not found. Email not sent.")
            return False

        try:
            template_path = f"tenants/{tenant_slug}/{template_name}"
            try:
                template = self.jinja_env.get_template(template_path)
            except jinja2.TemplateNotFound:
                template_path = f"tenants/default/{template_name}"
                template = self.jinja_env.get_template(template_path)
            
            # Load subject from configuration if not provided
            if not subject:
                try:
                    subject_template = self.jinja_env.get_template(f"{template_path}.subject")
                    subject = subject_template.render(**context)
                except jinja2.TemplateNotFound:
                    subject = "Vimmit Academic Notification"
            
            html_content = template.render(**context)
        except Exception as e:
            print(f"Error rendering email template: {e}")
            return False

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = f"{self.sender_name} <{self.sender_email}>"
        msg['To'] = to_email
        msg.set_content(html_content, subtype='html')

        try:
            await anyio.to_thread.run_sync(self._send_smtp_sync, msg)
            return True
        except Exception as e:
            print(f"Error sending email through ZeptoMail SMTP: {e}")
            return False

    def _send_smtp_sync(self, msg: EmailMessage):
        """Synchronous SMTP sending logic to be run in a thread"""
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.token)
            server.send_message(msg)

    async def send_password_reset(self, to_email: str, reset_link: str, tenant_slug: str = "default"):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="forgot_password.html",
            context={
                "reset_link": reset_link, 
                "email": to_email,
                "frontend_url": settings.FRONTEND_URL
            },
            tenant_slug=tenant_slug
        )

    async def send_lead_confirmation(self, to_email: str, full_name: str, tenant_slug: str, tenant_name: str):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="lead_confirmation.html",
            context={
                "full_name": full_name,
                "tenant_name": tenant_name,
                "frontend_url": settings.FRONTEND_URL
            },
            tenant_slug=tenant_slug
        )

    async def send_new_lead_admin(self, to_email: str, lead_data: dict, tenant_slug: str, tenant_name: str):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="new_lead_admin.html",
            context={
                "lead_data": lead_data,
                "tenant_name": tenant_name,
                "frontend_url": settings.FRONTEND_URL
            },
            tenant_slug=tenant_slug
        )

    async def send_admission_confirmation(self, to_email: str, full_name: str, tenant_slug: str, tenant_name: str):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="admission_confirmation.html",
            context={
                "full_name": full_name,
                "tenant_name": tenant_name,
                "frontend_url": settings.FRONTEND_URL
            },
            tenant_slug=tenant_slug,
            subject=f"Confirmación de Proceso de Matrícula - {tenant_name}"
        )

    async def send_enrollment_finalized(
        self, 
        to_email: str, 
        full_name: str, 
        tenant_slug: str, 
        tenant_name: str,
        is_new_user: bool = False,
        temp_password: str = ""
    ):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="enrollment_confirmed.html",
            context={
                "full_name": full_name,
                "tenant_name": tenant_name,
                "is_new_user": is_new_user,
                "temp_password": temp_password,
                "frontend_url": settings.FRONTEND_URL,
                "email": to_email
            },
            tenant_slug=tenant_slug,
            subject=f"¡Bienvenido! Matrícula Finalizada exitosamente - {tenant_name}"
        )

    async def send_balance_statement(
        self,
        to_email: str,
        full_name: str,
        tenant_slug: str,
        tenant_name: str,
        balance_summary: 'StudentBalanceResponse'
    ):
        settings = get_settings()
        return await self.send_email(
            to_email=to_email,
            template_name="balance_statement.html",
            context={
                "full_name": full_name,
                "tenant_name": tenant_name,
                "balance_summary": balance_summary,
                "frontend_url": settings.FRONTEND_URL
            },
            tenant_slug=tenant_slug,
            subject=f"Estado de Cuenta - {tenant_name}"
        )
