import { Switch } from "@/components/ui/switch";
import { SettingsSection, SettingsRow } from "./SettingsSection";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="SMS Notifications"
        description="Keep customers informed about their bills and connection — reduces support calls and improves on-time payments."
      >
        <div className="divide-y divide-border">
          <SettingsRow
            label="Bill Generated"
            description="Notify customers instantly when a new bill is created"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Payment Confirmation"
            description="Send confirmation when payment is received — builds trust"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Due Date Reminder"
            description="Remind customers before the due date to avoid late payments"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Suspension Warning"
            description="Warn customers before their connection is suspended"
          >
            <Switch defaultChecked />
          </SettingsRow>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Push Notifications"
        description="Reach customers on their phone instantly — works even without SMS credits."
      >
        <div className="divide-y divide-border">
          <SettingsRow
            label="New Bill Alert"
            description="Push notification when a new bill is ready"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Payment Confirmation"
            description="Instant confirmation on successful payment"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Connection Status Change"
            description="Notify when their internet is activated or suspended"
          >
            <Switch defaultChecked />
          </SettingsRow>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Staff Email Alerts"
        description="Keep your team updated on daily operations without logging in."
      >
        <div className="divide-y divide-border">
          <SettingsRow
            label="Daily Business Summary"
            description="Receive a daily recap of bills, payments, and new customers"
          >
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="New Customer Added"
            description="Get notified when a new customer joins"
          >
            <Switch />
          </SettingsRow>
          <SettingsRow
            label="Large Payment Alert"
            description="Get alerted on payments above a set threshold"
          >
            <Switch />
          </SettingsRow>
        </div>
      </SettingsSection>
    </div>
  );
}
