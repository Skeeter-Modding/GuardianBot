import discord
from discord.ext import commands
from discord import app_commands
import asyncio
import json
import datetime
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

class TicketBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        intents.guilds = True
        
        super().__init__(
            command_prefix='!',
            intents=intents,
            description="Guardian Bot - Premium Discord Security & Ticket System"
        )
        
        # Data storage
        self.active_tickets = {}
        self.ticket_stats = {}
        self.lockdown_guilds = set()
        
        # Trump responses
        self.trump_responses = {
            'ticket_created': [
                "TREMENDOUS! {user} just created a ticket! We're going to solve this BIGLY!",
                "This is going to be HUGE! {user} needs help and we're the BEST at helping!",
                "MAGNIFICENT ticket by {user}! Our support is INCREDIBLE, the best support!",
                "WINNING! {user} made a smart move creating this ticket! We're going to CRUSH this problem!"
            ],
            'ticket_claimed': [
                "FANTASTIC! {user} claimed this ticket! They're going to do an AMAZING job!",
                "This is what I call LEADERSHIP! {user} is making support great again!",
                "PHENOMENAL work by {user}! They're going to handle this like a CHAMPION!",
                "OUTSTANDING! {user} is going to DESTROY this problem! Total winner!"
            ],
            'ticket_closed': [
                "Another ticket OBLITERATED by {user}! TREMENDOUS work!",
                "MAGNIFICENT! {user} closed another one! They're UNSTOPPABLE!",
                "INCREDIBLE job by {user}! Making customer service great again!",
                "PHENOMENAL! {user} is a TOTAL WINNER! Problem solved BIGLY!"
            ]
        }
    
    async def setup_hook(self):
        # Sync commands
        try:
            synced = await self.tree.sync()
            print(f"Synced {len(synced)} command(s)")
        except Exception as e:
            print(f"Failed to sync commands: {e}")
    
    async def on_ready(self):
        print(f'🛡️ Guardian Bot is online! Logged in as {self.user}')
        print(f'🎫 Ticket System: ACTIVE')
        print(f'🤖 Trump AI: LOADED AND READY')
        
        # Set status
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="for raids & tickets | Making Discord Great Again! 🇺🇸"
            )
        )
    
    def has_permission(self, member):
        """Check if member has staff permissions"""
        if member.guild_permissions.administrator:
            return True
        
        staff_roles = config.get('ticketSystem', {}).get('staffRoleIds', [])
        admin_roles = config.get('adminRoleIds', [])
        
        member_roles = [str(role.id) for role in member.roles]
        return any(role_id in member_roles for role_id in staff_roles + admin_roles)
    
    def get_trump_response(self, category, **kwargs):
        """Get a random Trump response"""
        import random
        responses = self.trump_responses.get(category, ["TREMENDOUS!"])
        response = random.choice(responses)
        return response.format(**kwargs)

# Initialize bot
bot = TicketBot()

@bot.tree.command(name="ticket", description="Create a new support ticket")
@app_commands.describe(
    subject="Brief description of your issue",
    priority="Priority level of your ticket"
)
@app_commands.choices(priority=[
    app_commands.Choice(name="🔴 High - Urgent Issue", value="high"),
    app_commands.Choice(name="🟡 Medium - Normal Issue", value="medium"),
    app_commands.Choice(name="🟢 Low - General Question", value="low")
])
async def create_ticket(interaction: discord.Interaction, subject: str, priority: Optional[str] = "medium"):
    """Create a new support ticket"""
    
    # Check if user has too many tickets
    user_tickets = sum(1 for ticket in bot.active_tickets.values() if ticket['creator'] == interaction.user.id)
    max_tickets = config.get('ticketSystem', {}).get('maxTicketsPerUser', 3)
    
    if user_tickets >= max_tickets:
        await interaction.response.send_message(
            f"❌ You already have {user_tickets} active tickets! Please close existing tickets before creating new ones.",
            ephemeral=True
        )
        return
    
    guild = interaction.guild
    category_id = config.get('ticketSystem', {}).get('categoryId')
    
    # Find or create ticket category
    category = None
    if category_id:
        category = guild.get_channel(category_id)
    
    if not category:
        category = await guild.create_category(
            name="🎫 Support Tickets",
            overwrites={
                guild.default_role: discord.PermissionOverwrite(view_channel=False),
                guild.me: discord.PermissionOverwrite(
                    view_channel=True,
                    send_messages=True,
                    manage_messages=True,
                    manage_channels=True
                )
            }
        )
        # Update config
        config['ticketSystem']['categoryId'] = category.id
        with open('config.json', 'w') as f:
            json.dump(config, f, indent=2)
    
    # Generate ticket number
    ticket_number = str(datetime.datetime.now().timestamp()).split('.')[0][-6:]
    channel_name = f"ticket-{interaction.user.name}-{ticket_number}".lower()
    
    # Remove invalid characters
    channel_name = ''.join(c for c in channel_name if c.isalnum() or c in '-_')
    
    # Create ticket channel
    overwrites = {
        guild.default_role: discord.PermissionOverwrite(view_channel=False),
        interaction.user: discord.PermissionOverwrite(
            view_channel=True,
            send_messages=True,
            read_message_history=True,
            attach_files=True
        ),
        guild.me: discord.PermissionOverwrite(
            view_channel=True,
            send_messages=True,
            manage_messages=True,
            manage_channels=True
        )
    }
    
    # Add staff permissions
    staff_roles = config.get('ticketSystem', {}).get('staffRoleIds', [])
    for role_id in staff_roles:
        role = guild.get_role(int(role_id))
        if role:
            overwrites[role] = discord.PermissionOverwrite(
                view_channel=True,
                send_messages=True,
                manage_messages=True,
                read_message_history=True
            )
    
    ticket_channel = await guild.create_text_channel(
        name=channel_name,
        category=category,
        overwrites=overwrites,
        topic=f"Support ticket for {interaction.user.name} | Subject: {subject}"
    )
    
    # Store ticket data
    bot.active_tickets[ticket_channel.id] = {
        'creator': interaction.user.id,
        'subject': subject,
        'priority': priority,
        'created_at': datetime.datetime.now().isoformat(),
        'claimed_by': None,
        'status': 'open'
    }
    
    # Priority colors and settings
    priority_config = {
        'high': {'color': 0xff0000, 'emoji': '🔴'},
        'medium': {'color': 0xffff00, 'emoji': '🟡'},
        'low': {'color': 0x00ff00, 'emoji': '🟢'}
    }
    
    pconfig = priority_config.get(priority, priority_config['medium'])
    
    # Create ticket embed
    embed = discord.Embed(
        title=f"{pconfig['emoji']} NEW SUPPORT TICKET #{ticket_number}",
        description=f"**Subject:** {subject}\n**Priority:** {pconfig['emoji']} {priority.upper()}\n**Created by:** {interaction.user.mention}",
        color=pconfig['color'],
        timestamp=datetime.datetime.now()
    )
    
    embed.add_field(
        name="📋 Instructions",
        value="Please describe your issue in detail below. A staff member will assist you shortly!",
        inline=False
    )
    
    embed.add_field(name="🏷️ Ticket ID", value=f"#{ticket_number}", inline=True)
    embed.add_field(name="📊 Status", value="🟡 Waiting for staff", inline=True)
    embed.add_field(name="⏰ Created", value=f"<t:{int(datetime.datetime.now().timestamp())}:F>", inline=True)
    
    embed.set_footer(text="Guardian Bot Ticket System - Premium Support! 🏆")
    
    # Create buttons
    view = TicketView()
    
    # Send welcome message
    welcome_msg = await ticket_channel.send(
        content=f"Welcome {interaction.user.mention}! 🎫",
        embed=embed,
        view=view
    )
    
    # Pin the message
    await welcome_msg.pin()
    
    # Trump response
    trump_response = bot.get_trump_response('ticket_created', user=interaction.user.mention)
    
    # Reply to user
    await interaction.response.send_message(
        f"✅ **TREMENDOUS!** Your support ticket has been created!\n\n{trump_response}\n\n**Ticket:** {ticket_channel.mention}\n**Subject:** {subject}\n**Priority:** {pconfig['emoji']} {priority.upper()}",
        ephemeral=True
    )
    
    print(f"🎫 Ticket created: {channel_name} by {interaction.user}")

@bot.tree.command(name="claim-ticket", description="Claim this support ticket (Staff Only)")
async def claim_ticket(interaction: discord.Interaction, assign_to: Optional[discord.Member] = None):
    """Claim a ticket"""
    if not bot.has_permission(interaction.user):
        await interaction.response.send_message(
            "❌ Only staff members can claim tickets!",
            ephemeral=True
        )
        return
    
    if interaction.channel.id not in bot.active_tickets:
        await interaction.response.send_message(
            "❌ This is not a ticket channel!",
            ephemeral=True
        )
        return
    
    ticket = bot.active_tickets[interaction.channel.id]
    
    if ticket['claimed_by']:
        claimer = bot.get_user(ticket['claimed_by'])
        await interaction.response.send_message(
            f"❌ This ticket is already claimed by {claimer.mention if claimer else 'someone'}!",
            ephemeral=True
        )
        return
    
    # Determine who to assign to
    target_user = assign_to or interaction.user
    
    if assign_to and not bot.has_permission(assign_to):
        await interaction.response.send_message(
            "❌ You can only assign tickets to staff members!",
            ephemeral=True
        )
        return
    
    # Update ticket
    ticket['claimed_by'] = target_user.id
    ticket['claimed_at'] = datetime.datetime.now().isoformat()
    ticket['status'] = 'claimed'
    
    # Update stats
    if target_user.id not in bot.ticket_stats:
        bot.ticket_stats[target_user.id] = {'claimed': 0, 'closed': 0, 'response_times': []}
    
    bot.ticket_stats[target_user.id]['claimed'] += 1
    
    # Trump response
    trump_response = bot.get_trump_response('ticket_claimed', user=target_user.mention)
    
    # Create claim embed
    embed = discord.Embed(
        title="🎫 TICKET CLAIMED!",
        description=f"**{target_user.mention} has claimed this ticket!**\n\n{trump_response}",
        color=0x00ff00,
        timestamp=datetime.datetime.now()
    )
    
    embed.add_field(name="👨‍💼 Claimed By", value=target_user.mention, inline=True)
    embed.add_field(name="📊 Total Claims", value=str(bot.ticket_stats[target_user.id]['claimed']), inline=True)
    embed.add_field(name="📋 Next Steps", value="The assigned staff member will help resolve your issue!", inline=False)
    
    embed.set_footer(text="Guardian Bot Ticket System - Making Support Great Again! 🇺🇸")
    
    await interaction.response.send_message(embed=embed)
    
    # Update channel topic
    await interaction.channel.edit(
        topic=f"🎫 Claimed by {target_user.name} | Created: {ticket['created_at']}"
    )
    
    print(f"🎫 Ticket claimed: {interaction.channel.name} by {target_user}")

@bot.tree.command(name="close-ticket", description="Close this support ticket")
async def close_ticket(interaction: discord.Interaction, reason: Optional[str] = "No reason provided"):
    """Close a ticket"""
    
    if interaction.channel.id not in bot.active_tickets:
        await interaction.response.send_message(
            "❌ This is not a ticket channel!",
            ephemeral=True
        )
        return
    
    ticket = bot.active_tickets[interaction.channel.id]
    
    # Check permissions
    is_staff = bot.has_permission(interaction.user)
    is_creator = ticket['creator'] == interaction.user.id
    
    if not (is_staff or is_creator):
        await interaction.response.send_message(
            "❌ Only staff members or the ticket creator can close tickets!",
            ephemeral=True
        )
        return
    
    # Update stats if staff member
    if is_staff:
        if interaction.user.id not in bot.ticket_stats:
            bot.ticket_stats[interaction.user.id] = {'claimed': 0, 'closed': 0, 'response_times': []}
        
        bot.ticket_stats[interaction.user.id]['closed'] += 1
    
    # Trump response
    trump_response = bot.get_trump_response('ticket_closed', user=interaction.user.mention)
    
    # Create closure embed
    embed = discord.Embed(
        title="🎫 TICKET CLOSED!",
        description=f"**This ticket has been closed by {interaction.user.mention}**\n\n{trump_response}",
        color=0xff6600,
        timestamp=datetime.datetime.now()
    )
    
    embed.add_field(name="🔒 Closed By", value=interaction.user.mention, inline=True)
    embed.add_field(name="📝 Reason", value=reason, inline=True)
    embed.add_field(name="⏰ Closed At", value=f"<t:{int(datetime.datetime.now().timestamp())}:F>", inline=False)
    
    embed.set_footer(text="Guardian Bot Ticket System - Tremendous Support! 🏆")
    
    await interaction.response.send_message(embed=embed)
    
    # Remove from active tickets
    del bot.active_tickets[interaction.channel.id]
    
    # Delete channel after delay
    await asyncio.sleep(5)
    try:
        await interaction.channel.delete(reason=f"Ticket closed by {interaction.user}")
        print(f"🎫 Ticket closed and deleted: {interaction.channel.name} by {interaction.user}")
    except:
        pass

@bot.tree.command(name="ticket-panel", description="Create ticket creation panel (Admin Only)")
async def ticket_panel(interaction: discord.Interaction, channel: Optional[discord.TextChannel] = None):
    """Create a ticket panel"""
    if not bot.has_permission(interaction.user):
        await interaction.response.send_message(
            "❌ Only administrators can create ticket panels!",
            ephemeral=True
        )
        return
    
    target_channel = channel or interaction.channel
    
    embed = discord.Embed(
        title="🎫 SUPPORT TICKET SYSTEM",
        description="""**Need help? Create a support ticket!**

Our amazing staff team is here to help you with any questions or issues you might have. Click the button below to create a new support ticket.

**What to include:**
• Clear description of your issue
• Any relevant screenshots
• Steps you've already tried

**Response Times:**
🔴 High Priority: < 30 minutes
🟡 Medium Priority: < 2 hours
🟢 Low Priority: < 24 hours""",
        color=0x0099ff,
        timestamp=datetime.datetime.now()
    )
    
    embed.add_field(
        name="📋 How it works",
        value="1️⃣ Click \"Create Ticket\"\n2️⃣ Fill out the form\n3️⃣ Wait for staff response\n4️⃣ Get your problem solved!",
        inline=True
    )
    
    embed.add_field(
        name="🏆 Premium Support",
        value="Fast, professional, and friendly assistance guaranteed!",
        inline=True
    )
    
    embed.set_footer(text="Guardian Bot Ticket System - Making Support Great Again! 🇺🇸")
    
    view = PanelView()
    
    await target_channel.send(embed=embed, view=view)
    
    await interaction.response.send_message(
        f"✅ Ticket panel created successfully in {target_channel.mention}!",
        ephemeral=True
    )

class TicketView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
    
    @discord.ui.button(label="Claim Ticket", style=discord.ButtonStyle.success, emoji="👨‍💼")
    async def claim_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        await claim_ticket.callback(interaction)
    
    @discord.ui.button(label="Close Ticket", style=discord.ButtonStyle.danger, emoji="🔒")
    async def close_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        await close_ticket.callback(interaction)

class PanelView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
    
    @discord.ui.button(label="Create Support Ticket", style=discord.ButtonStyle.primary, emoji="🎫")
    async def create_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        modal = TicketModal()
        await interaction.response.send_modal(modal)

class TicketModal(discord.ui.Modal):
    def __init__(self):
        super().__init__(title="🎫 Create Support Ticket")
        
        self.subject = discord.ui.TextInput(
            label="Subject",
            placeholder="Brief description of your issue...",
            max_length=100,
            required=True
        )
        
        self.description = discord.ui.TextInput(
            label="Detailed Description",
            placeholder="Please provide more details about your issue...",
            style=discord.TextStyle.paragraph,
            max_length=1000,
            required=True
        )
        
        self.priority = discord.ui.TextInput(
            label="Priority (high/medium/low)",
            placeholder="high, medium, or low",
            max_length=6,
            required=False,
            default="medium"
        )
        
        self.add_item(self.subject)
        self.add_item(self.description)
        self.add_item(self.priority)
    
    async def on_submit(self, interaction: discord.Interaction):
        # Validate priority
        priority = self.priority.value.lower() if self.priority.value else "medium"
        if priority not in ["high", "medium", "low"]:
            priority = "medium"
        
        # Create ticket with combined subject and description
        full_subject = f"{self.subject.value} - {self.description.value}"
        
        # Call the create_ticket function
        await create_ticket.callback(interaction, full_subject, priority)

if __name__ == "__main__":
    bot.run(config['token'])