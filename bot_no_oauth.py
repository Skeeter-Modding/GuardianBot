# Guardian Bot - No OAuth2 Version
# This version runs without OAuth2 dashboard - just the Discord bot

import discord
from discord.ext import commands
import json
import asyncio
import random

# Load configuration
with open('config.json', 'r') as f:
    config = json.load(f)

# Bot setup with all intents for full functionality
intents = discord.Intents.all()
bot = commands.Bot(command_prefix='!', intents=intents)

# Trump-style responses for entertainment
TRUMP_RESPONSES = [
    "That's fake news! FAKE NEWS!",
    "Nobody knows Discord bots better than me, believe me!",
    "We're gonna make this server great again!",
    "This bot is tremendous, absolutely tremendous!",
    "The Democrats could never build a bot this good!",
    "WRONG! That's totally wrong!",
    "We have the best moderators, don't we folks?",
    "This server is gonna be HUGE!",
    "Nobody talks trash better than me, nobody!",
    "You're fired! Just kidding, you're not fired.",
    "The fake news media won't report how great this bot is!",
    "We're winning so much, you're gonna get tired of winning!"
]

# Skeeter protection keywords
SKEETER_KEYWORDS = ['skeeter', 'skeet', 'mosquito', 'buzz', 'bite']

@bot.event
async def on_ready():
    print(f"""
╔════════════════════════════════════════════════════════════════════╗
║              🛡️ GUARDIAN BOT READY (NO OAUTH2)                     ║
╚════════════════════════════════════════════════════════════════════╝

Bot: {bot.user}
Servers: {len(bot.guilds)}
Users: {len(set(bot.get_all_members()))}

🎯 Features Active:
  ✅ Slash Commands
  ✅ Ticket System with Modals
  ✅ Trump AI Responses
  ✅ Skeeter Protection
  ✅ Moderation Tools
  ❌ OAuth2 Dashboard (Disabled)

🔗 Invite URLs:
Guild Install: https://discord.com/api/oauth2/authorize?client_id={config['client_id']}&permissions=8&scope=bot%20applications.commands
User Install: https://discord.com/api/oauth2/authorize?client_id={config['client_id']}&scope=applications.commands

Ready to serve!
""")

    # Sync slash commands
    try:
        synced = await bot.tree.sync()
        print(f"✅ Synced {len(synced)} slash commands")
    except Exception as e:
        print(f"❌ Failed to sync commands: {e}")

# Ticket Modal for creating support tickets
class TicketModal(discord.ui.Modal, title='Create Support Ticket'):
    def __init__(self):
        super().__init__()

    subject = discord.ui.TextInput(
        label='Ticket Subject',
        placeholder='Brief description of your issue...',
        required=True,
        max_length=100
    )

    description = discord.ui.TextInput(
        label='Detailed Description',
        placeholder='Please provide as much detail as possible...',
        style=discord.TextStyle.paragraph,
        required=True,
        max_length=1000
    )

    priority = discord.ui.TextInput(
        label='Priority (Low/Medium/High/Urgent)',
        placeholder='How urgent is this issue?',
        required=False,
        default='Medium',
        max_length=10
    )

    async def on_submit(self, interaction: discord.Interaction):
        # Create ticket channel
        guild = interaction.guild
        category = discord.utils.get(guild.categories, name="Support Tickets")
        
        if not category:
            category = await guild.create_category("Support Tickets")

        # Create private ticket channel
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            interaction.user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
        }

        ticket_channel = await guild.create_text_channel(
            f"ticket-{interaction.user.name}",
            category=category,
            overwrites=overwrites
        )

        # Create ticket embed
        embed = discord.Embed(
            title=f"🎫 Ticket: {self.subject.value}",
            description=self.description.value,
            color=0x00ff00,
            timestamp=interaction.created_at
        )
        embed.add_field(name="👤 Created by", value=interaction.user.mention, inline=True)
        embed.add_field(name="⚡ Priority", value=self.priority.value, inline=True)
        embed.add_field(name="📊 Status", value="Open", inline=True)
        embed.set_thumbnail(url=interaction.user.display_avatar.url)

        # Close ticket button
        class CloseTicketView(discord.ui.View):
            def __init__(self):
                super().__init__(timeout=None)

            @discord.ui.button(label='Close Ticket', style=discord.ButtonStyle.danger, emoji='🔒')
            async def close_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
                embed = discord.Embed(
                    title="🔒 Ticket Closed",
                    description=f"Ticket closed by {interaction.user.mention}",
                    color=0xff0000,
                    timestamp=interaction.created_at
                )
                await interaction.response.send_message(embed=embed)
                await asyncio.sleep(5)
                await ticket_channel.delete()

        await ticket_channel.send(embed=embed, view=CloseTicketView())
        
        await interaction.response.send_message(
            f"✅ Ticket created! Check {ticket_channel.mention}",
            ephemeral=True
        )

# Ticket command
@bot.tree.command(name="ticket", description="Create a support ticket")
async def ticket(interaction: discord.Interaction):
    await interaction.response.send_modal(TicketModal())

# Trump AI command
@bot.tree.command(name="trump", description="Get a Trump-style response")
async def trump(interaction: discord.Interaction, message: str = None):
    response = random.choice(TRUMP_RESPONSES)
    
    if message:
        if any(word in message.lower() for word in ['fake', 'wrong', 'bad']):
            response = "WRONG! You're totally wrong! SAD!"
        elif any(word in message.lower() for word in ['great', 'amazing', 'best']):
            response = "That's right! We have the best people, don't we folks?"
    
    embed = discord.Embed(
        title="🇺🇸 Trump Bot Says:",
        description=response,
        color=0xff0000
    )
    await interaction.response.send_message(embed=embed)

# Skeeter protection
@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    # Check for Skeeter keywords
    if any(keyword in message.content.lower() for keyword in SKEETER_KEYWORDS):
        embed = discord.Embed(
            title="🦟 Skeeter Alert!",
            description="Skeeter detected and protected against!",
            color=0xffff00
        )
        await message.channel.send(embed=embed, delete_after=10)
        await message.delete()
        return
    
    await bot.process_commands(message)

# Moderation commands
@bot.tree.command(name="kick", description="Kick a user from the server")
@discord.app_commands.describe(user="User to kick", reason="Reason for kick")
async def kick(interaction: discord.Interaction, user: discord.Member, reason: str = "No reason provided"):
    if not interaction.user.guild_permissions.kick_members:
        await interaction.response.send_message("❌ You don't have permission to kick members!", ephemeral=True)
        return
    
    try:
        await user.kick(reason=reason)
        embed = discord.Embed(
            title="👢 User Kicked",
            description=f"{user.mention} has been kicked",
            color=0xff0000
        )
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=interaction.user.mention, inline=True)
        await interaction.response.send_message(embed=embed)
    except Exception as e:
        await interaction.response.send_message(f"❌ Failed to kick user: {e}", ephemeral=True)

@bot.tree.command(name="ban", description="Ban a user from the server")
@discord.app_commands.describe(user="User to ban", reason="Reason for ban")
async def ban(interaction: discord.Interaction, user: discord.Member, reason: str = "No reason provided"):
    if not interaction.user.guild_permissions.ban_members:
        await interaction.response.send_message("❌ You don't have permission to ban members!", ephemeral=True)
        return
    
    try:
        await user.ban(reason=reason)
        embed = discord.Embed(
            title="🔨 User Banned",
            description=f"{user.mention} has been banned",
            color=0xff0000
        )
        embed.add_field(name="Reason", value=reason, inline=False)
        embed.add_field(name="Moderator", value=interaction.user.mention, inline=True)
        await interaction.response.send_message(embed=embed)
    except Exception as e:
        await interaction.response.send_message(f"❌ Failed to ban user: {e}", ephemeral=True)

@bot.tree.command(name="clear", description="Clear messages from the channel")
@discord.app_commands.describe(amount="Number of messages to clear (max 100)")
async def clear(interaction: discord.Interaction, amount: int):
    if not interaction.user.guild_permissions.manage_messages:
        await interaction.response.send_message("❌ You don't have permission to manage messages!", ephemeral=True)
        return
    
    if amount > 100:
        await interaction.response.send_message("❌ Cannot clear more than 100 messages at once!", ephemeral=True)
        return
    
    try:
        await interaction.response.defer()
        deleted = await interaction.channel.purge(limit=amount)
        embed = discord.Embed(
            title="🧹 Messages Cleared",
            description=f"Cleared {len(deleted)} messages",
            color=0x00ff00
        )
        await interaction.followup.send(embed=embed, delete_after=10)
    except Exception as e:
        await interaction.followup.send(f"❌ Failed to clear messages: {e}", ephemeral=True)

# Info commands
@bot.tree.command(name="serverinfo", description="Get information about the server")
async def serverinfo(interaction: discord.Interaction):
    guild = interaction.guild
    embed = discord.Embed(
        title=f"🏰 {guild.name}",
        color=0x0099ff,
        timestamp=interaction.created_at
    )
    embed.set_thumbnail(url=guild.icon.url if guild.icon else None)
    embed.add_field(name="👑 Owner", value=guild.owner.mention, inline=True)
    embed.add_field(name="👥 Members", value=guild.member_count, inline=True)
    embed.add_field(name="📅 Created", value=guild.created_at.strftime("%Y-%m-%d"), inline=True)
    embed.add_field(name="🔊 Voice Channels", value=len(guild.voice_channels), inline=True)
    embed.add_field(name="💬 Text Channels", value=len(guild.text_channels), inline=True)
    embed.add_field(name="🏷️ Roles", value=len(guild.roles), inline=True)
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="userinfo", description="Get information about a user")
@discord.app_commands.describe(user="User to get info about")
async def userinfo(interaction: discord.Interaction, user: discord.Member = None):
    if user is None:
        user = interaction.user
    
    embed = discord.Embed(
        title=f"👤 {user.display_name}",
        color=user.top_role.color,
        timestamp=interaction.created_at
    )
    embed.set_thumbnail(url=user.display_avatar.url)
    embed.add_field(name="🏷️ Username", value=f"{user.name}#{user.discriminator}", inline=True)
    embed.add_field(name="🆔 ID", value=user.id, inline=True)
    embed.add_field(name="📅 Joined Discord", value=user.created_at.strftime("%Y-%m-%d"), inline=True)
    embed.add_field(name="📅 Joined Server", value=user.joined_at.strftime("%Y-%m-%d"), inline=True)
    embed.add_field(name="🎭 Top Role", value=user.top_role.mention, inline=True)
    embed.add_field(name="🤖 Bot", value="Yes" if user.bot else "No", inline=True)
    
    await interaction.response.send_message(embed=embed)

# Bot status command
@bot.tree.command(name="botstatus", description="Get bot status and statistics")
async def botstatus(interaction: discord.Interaction):
    embed = discord.Embed(
        title="🛡️ Guardian Bot Status",
        color=0x00ff00,
        timestamp=interaction.created_at
    )
    embed.add_field(name="🏠 Servers", value=len(bot.guilds), inline=True)
    embed.add_field(name="👥 Users", value=len(set(bot.get_all_members())), inline=True)
    embed.add_field(name="⚡ Latency", value=f"{round(bot.latency * 1000)}ms", inline=True)
    embed.add_field(name="🔗 OAuth2", value="Disabled", inline=True)
    embed.add_field(name="🎫 Tickets", value="Active", inline=True)
    embed.add_field(name="🛡️ Protection", value="Skeeter Guard", inline=True)
    
    await interaction.response.send_message(embed=embed)

if __name__ == "__main__":
    print("🚀 Starting Guardian Bot (No OAuth2)...")
    bot.run(config['token'])