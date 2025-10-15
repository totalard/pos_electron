"""
Settings models for storing company-wide and user-specific settings.
"""
from tortoise import fields
from .base import BaseModel


class CompanySettings(BaseModel):
    """
    Company-wide settings that apply to all users.
    Only one record should exist in this table.
    """
    
    # General Settings
    business_type = fields.CharField(
        max_length=50,
        default="restaurant",
        description="Type of business: restaurant or retail"
    )
    language = fields.CharField(
        max_length=10,
        default="en",
        description="Default language code (e.g., en, es, fr)"
    )
    timezone = fields.CharField(
        max_length=50,
        default="UTC",
        description="Company timezone (e.g., America/New_York)"
    )
    number_format = fields.CharField(
        max_length=20,
        default="1,234.56",
        description="Number format preference"
    )
    
    # Company Information
    company_name = fields.CharField(max_length=255, null=True)
    company_email = fields.CharField(max_length=255, null=True)
    company_phone = fields.CharField(max_length=50, null=True)
    company_address_street = fields.CharField(max_length=255, null=True)
    company_address_city = fields.CharField(max_length=100, null=True)
    company_address_state = fields.CharField(max_length=100, null=True)
    company_address_zip = fields.CharField(max_length=20, null=True)
    company_address_country = fields.CharField(max_length=100, null=True)
    currency = fields.CharField(max_length=10, default="USD")
    
    # Multiple Locations/Branches
    enable_multi_location = fields.BooleanField(default=False)
    locations = fields.JSONField(
        default=list,
        description="List of company locations/branches"
    )
    
    # Fiscal Year Settings
    fiscal_year_start_month = fields.IntField(
        default=1,
        description="Fiscal year start month (1-12)"
    )
    fiscal_year_start_day = fields.IntField(
        default=1,
        description="Fiscal year start day (1-31)"
    )
    
    # Business Hours
    business_hours = fields.JSONField(
        default=dict,
        description="Business hours for each day of the week"
    )
    
    # Tax Settings
    tax_rates = fields.JSONField(
        default=list,
        description="List of tax rates with country, region, rate, and description"
    )
    enable_tax_exemptions = fields.BooleanField(default=False)
    tax_exemption_codes = fields.JSONField(
        default=list,
        description="List of tax exemption codes"
    )
    enable_compound_tax = fields.BooleanField(default=False)
    tax_reporting_frequency = fields.CharField(
        max_length=20,
        default="monthly",
        description="Tax reporting frequency: monthly, quarterly, annually"
    )
    
    # Inventory Settings
    track_inventory = fields.BooleanField(default=True)
    low_stock_threshold = fields.IntField(default=10)
    enable_low_stock_alerts = fields.BooleanField(default=True)
    auto_reorder_enabled = fields.BooleanField(default=False)
    auto_reorder_threshold = fields.IntField(default=5)
    default_reorder_quantity = fields.IntField(default=50)
    
    # Barcode Settings
    barcode_format = fields.CharField(
        max_length=20,
        default="EAN13",
        description="Default barcode format: EAN13, UPC, CODE128, etc."
    )
    auto_generate_barcodes = fields.BooleanField(default=False)
    
    # Unit of Measure
    enable_uom_conversions = fields.BooleanField(default=False)
    uom_conversions = fields.JSONField(
        default=list,
        description="Unit of measure conversion rules"
    )
    
    # Batch/Serial Number Tracking
    enable_batch_tracking = fields.BooleanField(default=False)
    enable_serial_tracking = fields.BooleanField(default=False)

    # Payment Settings
    enable_cash = fields.BooleanField(default=True)
    enable_card = fields.BooleanField(default=True)
    enable_mobile = fields.BooleanField(default=False)
    enable_gift_card = fields.BooleanField(default=False)
    enable_store_credit = fields.BooleanField(default=False)
    cash_rounding_enabled = fields.BooleanField(default=False)
    cash_rounding_amount = fields.DecimalField(max_digits=5, decimal_places=2, default=0.05)
    tip_enabled = fields.BooleanField(default=True)
    tip_suggestions = fields.JSONField(
        default=list,
        description="List of tip percentage suggestions"
    )
    split_payment_enabled = fields.BooleanField(default=True)
    partial_payment_enabled = fields.BooleanField(default=False)
    require_signature_amount = fields.DecimalField(max_digits=10, decimal_places=2, default=25.00)
    auto_open_cash_drawer = fields.BooleanField(default=True)

    # Receipt Settings
    print_receipt = fields.BooleanField(default=True)
    email_receipt = fields.BooleanField(default=False)
    sms_receipt = fields.BooleanField(default=False)
    show_logo = fields.BooleanField(default=True)
    show_tax_breakdown = fields.BooleanField(default=True)
    show_item_details = fields.BooleanField(default=True)
    show_barcode = fields.BooleanField(default=False)
    footer_message = fields.TextField(default="Thank you for your business!")
    header_message = fields.TextField(default="")
    paper_size = fields.CharField(
        max_length=20,
        default="thermal-80mm",
        description="Receipt paper size: thermal-80mm, thermal-58mm, a4, letter"
    )
    print_copies = fields.IntField(default=1)
    autoprint = fields.BooleanField(default=True)
    show_qr_code = fields.BooleanField(default=False)
    qr_code_content = fields.CharField(
        max_length=50,
        default="receipt-url",
        description="QR code content type: receipt-url, feedback-url, website"
    )

    # Hardware Settings
    printer_enabled = fields.BooleanField(default=True)
    printer_name = fields.CharField(max_length=255, default="Default Printer")
    printer_type = fields.CharField(
        max_length=20,
        default="thermal",
        description="Printer type: thermal, inkjet, laser"
    )
    cash_drawer_enabled = fields.BooleanField(default=True)
    cash_drawer_port = fields.CharField(max_length=50, default="COM1")
    barcode_scanner = fields.BooleanField(default=True)
    barcode_scanner_type = fields.CharField(
        max_length=20,
        default="usb",
        description="Scanner type: usb, bluetooth, serial"
    )
    card_reader_enabled = fields.BooleanField(default=True)
    card_reader_type = fields.CharField(
        max_length=20,
        default="usb",
        description="Card reader type: usb, bluetooth, network"
    )
    display_enabled = fields.BooleanField(default=False)
    display_type = fields.CharField(
        max_length=30,
        default="customer-display",
        description="Display type: customer-display, kitchen-display"
    )
    scale_enabled = fields.BooleanField(default=False)
    scale_port = fields.CharField(max_length=50, default="COM2")

    # Table Management (Restaurant-specific)
    enable_table_management = fields.BooleanField(default=False)
    number_of_tables = fields.IntField(default=20)
    default_table_capacity = fields.IntField(default=4)
    enable_reservations = fields.BooleanField(default=True)
    reservation_duration = fields.IntField(default=90, description="Default reservation duration in minutes")
    enable_waitlist = fields.BooleanField(default=True)
    auto_assign_tables = fields.BooleanField(default=False)
    enable_table_merging = fields.BooleanField(default=True)
    enable_table_transfer = fields.BooleanField(default=True)
    show_table_status = fields.BooleanField(default=True)

    # Shift Management
    enable_shift_management = fields.BooleanField(default=True)
    shift_duration = fields.IntField(default=8, description="Default shift duration in hours")
    require_shift_start = fields.BooleanField(default=True)
    require_shift_end = fields.BooleanField(default=True)

    # Cash Management
    enable_cash_management = fields.BooleanField(default=True)
    require_opening_float = fields.BooleanField(default=True)
    default_opening_float = fields.DecimalField(max_digits=10, decimal_places=2, default=200.00)

    # System Settings
    enable_order_numbers = fields.BooleanField(default=True)
    order_number_prefix = fields.CharField(max_length=10, default="ORD")
    enable_customer_display = fields.BooleanField(default=False)
    sound_enabled = fields.BooleanField(default=True)
    sound_volume = fields.IntField(default=50, description="Sound volume 0-100")

    class Meta:
        table = "company_settings"


class UserSettings(BaseModel):
    """
    User-specific settings that override company defaults.
    """
    
    user = fields.ForeignKeyField(
        "models.User",
        related_name="settings",
        on_delete=fields.CASCADE,
        unique=True
    )
    
    # Accessibility Settings
    date_format = fields.CharField(
        max_length=20,
        default="MM/DD/YYYY",
        description="Preferred date format"
    )
    font_size = fields.CharField(
        max_length=20,
        default="medium",
        description="Font size: small, medium, large, xlarge"
    )
    high_contrast = fields.BooleanField(default=False)
    reduced_motion = fields.BooleanField(default=False)
    
    # Color Blind Modes
    color_blind_mode = fields.CharField(
        max_length=20,
        default="none",
        description="Color blind mode: none, protanopia, deuteranopia, tritanopia"
    )
    
    # Screen Reader Support
    enable_screen_reader = fields.BooleanField(default=False)
    
    # Keyboard Shortcuts
    keyboard_shortcuts = fields.JSONField(
        default=dict,
        description="Custom keyboard shortcuts configuration"
    )
    enable_keyboard_shortcuts = fields.BooleanField(default=True)
    
    # Language Override (if different from company default)
    language_override = fields.CharField(max_length=10, null=True)
    
    # Timezone Override (if different from company default)
    timezone_override = fields.CharField(max_length=50, null=True)
    
    # Notification Preferences
    enable_notifications = fields.BooleanField(default=True)
    notification_sound = fields.BooleanField(default=True)
    
    # Dashboard Preferences
    dashboard_layout = fields.JSONField(
        default=dict,
        description="User's dashboard widget layout and preferences"
    )
    
    class Meta:
        table = "user_settings"

