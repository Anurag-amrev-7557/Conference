-- CreateTable NewsletterSignup
CREATE TABLE "NewsletterSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'waitlist',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "NewsletterSignup_email_key" ON "NewsletterSignup"("email");

-- Prevent duplicate conference registrations by email
CREATE UNIQUE INDEX "ConferenceRegistration_email_key" ON "ConferenceRegistration"("email");
