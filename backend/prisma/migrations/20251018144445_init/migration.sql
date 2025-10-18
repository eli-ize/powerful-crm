BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'SALES_REP',
    [avatar] NVARCHAR(1000),
    [company] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [isActive] BIT NOT NULL CONSTRAINT [users_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [lastLogin] DATETIME2,
    [permissions] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[refresh_tokens] (
    [id] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [refresh_tokens_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [refresh_tokens_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [refresh_tokens_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[contacts] (
    [id] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000),
    [title] NVARCHAR(1000),
    [company] NVARCHAR(1000) NOT NULL,
    [website] NVARCHAR(1000),
    [industry] NVARCHAR(1000),
    [location] NVARCHAR(1000),
    [source] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [contacts_status_df] DEFAULT 'NEW',
    [score] INT CONSTRAINT [contacts_score_df] DEFAULT 0,
    [tags] NVARCHAR(1000) NOT NULL,
    [customFields] NVARCHAR(1000),
    [qualificationCategory] NVARCHAR(1000),
    [qualificationReason] NVARCHAR(1000),
    [qualifiedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [contacts_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    [assignedTo] NVARCHAR(1000),
    CONSTRAINT [contacts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[deals] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [value] DECIMAL(10,2),
    [currency] NVARCHAR(1000) NOT NULL CONSTRAINT [deals_currency_df] DEFAULT 'USD',
    [stage] NVARCHAR(1000) NOT NULL CONSTRAINT [deals_stage_df] DEFAULT 'LEAD',
    [probability] INT CONSTRAINT [deals_probability_df] DEFAULT 0,
    [expectedCloseDate] DATETIME2,
    [actualCloseDate] DATETIME2,
    [lostReason] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [deals_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    [assignedTo] NVARCHAR(1000),
    [contactId] NVARCHAR(1000),
    CONSTRAINT [deals_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[campaigns] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [campaigns_type_df] DEFAULT 'OUTBOUND_CALLING',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [campaigns_status_df] DEFAULT 'DRAFT',
    [aiConfig] NVARCHAR(1000) NOT NULL,
    [rules] NVARCHAR(1000) NOT NULL,
    [stats] NVARCHAR(1000) NOT NULL,
    [startDate] DATETIME2,
    [endDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [campaigns_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [campaigns_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[campaign_contacts] (
    [id] NVARCHAR(1000) NOT NULL,
    [campaignId] NVARCHAR(1000) NOT NULL,
    [contactId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [campaign_contacts_status_df] DEFAULT 'PENDING',
    [stage] NVARCHAR(1000) NOT NULL CONSTRAINT [campaign_contacts_stage_df] DEFAULT 'new',
    [priority] INT NOT NULL CONSTRAINT [campaign_contacts_priority_df] DEFAULT 0,
    [attempts] INT NOT NULL CONSTRAINT [campaign_contacts_attempts_df] DEFAULT 0,
    [lastAttempt] DATETIME2,
    [nextAttempt] DATETIME2,
    [journey] NVARCHAR(1000),
    [addedAt] DATETIME2 NOT NULL CONSTRAINT [campaign_contacts_addedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [campaign_contacts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [campaign_contacts_campaignId_contactId_key] UNIQUE NONCLUSTERED ([campaignId],[contactId])
);

-- CreateTable
CREATE TABLE [dbo].[virtual_agents] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [virtual_agents_type_df] DEFAULT 'AI_CALLER',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [virtual_agents_status_df] DEFAULT 'IDLE',
    [config] NVARCHAR(1000) NOT NULL,
    [stats] NVARCHAR(1000) NOT NULL,
    [currentActivity] NVARCHAR(1000),
    [workingHours] NVARCHAR(1000) NOT NULL,
    [assignedCampaigns] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [virtual_agents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [virtual_agents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[call_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [telnyxCallId] NVARCHAR(1000),
    [direction] NVARCHAR(1000) NOT NULL CONSTRAINT [call_logs_direction_df] DEFAULT 'OUTBOUND',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [call_logs_status_df] DEFAULT 'INITIATED',
    [fromNumber] NVARCHAR(1000) NOT NULL,
    [toNumber] NVARCHAR(1000) NOT NULL,
    [contactId] NVARCHAR(1000),
    [startedAt] DATETIME2,
    [answeredAt] DATETIME2,
    [endedAt] DATETIME2,
    [duration] INT,
    [transcript] NVARCHAR(1000),
    [summary] NVARCHAR(1000),
    [sentiment] NVARCHAR(1000),
    [insights] NVARCHAR(1000),
    [outcome] NVARCHAR(1000),
    [nextAction] NVARCHAR(1000),
    [recordingUrl] NVARCHAR(1000),
    [campaignId] NVARCHAR(1000),
    [agentId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [call_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    [campaignContactId] NVARCHAR(1000),
    CONSTRAINT [call_logs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [call_logs_telnyxCallId_key] UNIQUE NONCLUSTERED ([telnyxCallId])
);

-- CreateTable
CREATE TABLE [dbo].[activities] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [contactId] NVARCHAR(1000),
    [dealId] NVARCHAR(1000),
    [campaignId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [activities_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [activities_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[email_templates] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [subject] NVARCHAR(1000) NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000),
    [isShared] BIT NOT NULL CONSTRAINT [email_templates_isShared_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [email_templates_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [email_templates_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notes] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(1000) NOT NULL,
    [isPrivate] BIT NOT NULL CONSTRAINT [notes_isPrivate_df] DEFAULT 0,
    [contactId] NVARCHAR(1000),
    [dealId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [notes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[tasks] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [tasks_status_df] DEFAULT 'PENDING',
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [tasks_priority_df] DEFAULT 'MEDIUM',
    [dueDate] DATETIME2,
    [completedAt] DATETIME2,
    [contactId] NVARCHAR(1000),
    [dealId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [tasks_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [createdBy] NVARCHAR(1000) NOT NULL,
    [assignedTo] NVARCHAR(1000),
    CONSTRAINT [tasks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [resource] NVARCHAR(1000) NOT NULL,
    [resourceId] NVARCHAR(1000),
    [oldData] NVARCHAR(1000),
    [newData] NVARCHAR(1000),
    [ipAddress] NVARCHAR(1000),
    [userAgent] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [audit_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[system_config] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [system_config_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [system_config_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [system_config_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[jobs] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [data] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [jobs_status_df] DEFAULT 'PENDING',
    [priority] INT NOT NULL CONSTRAINT [jobs_priority_df] DEFAULT 0,
    [attempts] INT NOT NULL CONSTRAINT [jobs_attempts_df] DEFAULT 0,
    [maxAttempts] INT NOT NULL CONSTRAINT [jobs_maxAttempts_df] DEFAULT 3,
    [error] NVARCHAR(1000),
    [result] NVARCHAR(1000),
    [scheduledAt] DATETIME2,
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [jobs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [jobs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[refresh_tokens] ADD CONSTRAINT [refresh_tokens_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[contacts] ADD CONSTRAINT [contacts_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[deals] ADD CONSTRAINT [deals_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[deals] ADD CONSTRAINT [deals_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[campaigns] ADD CONSTRAINT [campaigns_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[campaign_contacts] ADD CONSTRAINT [campaign_contacts_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[campaigns]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[campaign_contacts] ADD CONSTRAINT [campaign_contacts_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[virtual_agents] ADD CONSTRAINT [virtual_agents_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[call_logs] ADD CONSTRAINT [call_logs_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[call_logs] ADD CONSTRAINT [call_logs_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[call_logs] ADD CONSTRAINT [call_logs_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[campaigns]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[call_logs] ADD CONSTRAINT [call_logs_agentId_fkey] FOREIGN KEY ([agentId]) REFERENCES [dbo].[virtual_agents]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[call_logs] ADD CONSTRAINT [call_logs_campaignContactId_fkey] FOREIGN KEY ([campaignContactId]) REFERENCES [dbo].[campaign_contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activities] ADD CONSTRAINT [activities_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activities] ADD CONSTRAINT [activities_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activities] ADD CONSTRAINT [activities_dealId_fkey] FOREIGN KEY ([dealId]) REFERENCES [dbo].[deals]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[activities] ADD CONSTRAINT [activities_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[campaigns]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[email_templates] ADD CONSTRAINT [email_templates_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[notes] ADD CONSTRAINT [notes_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notes] ADD CONSTRAINT [notes_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notes] ADD CONSTRAINT [notes_dealId_fkey] FOREIGN KEY ([dealId]) REFERENCES [dbo].[deals]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[tasks] ADD CONSTRAINT [tasks_createdBy_fkey] FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[tasks] ADD CONSTRAINT [tasks_contactId_fkey] FOREIGN KEY ([contactId]) REFERENCES [dbo].[contacts]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[tasks] ADD CONSTRAINT [tasks_dealId_fkey] FOREIGN KEY ([dealId]) REFERENCES [dbo].[deals]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
