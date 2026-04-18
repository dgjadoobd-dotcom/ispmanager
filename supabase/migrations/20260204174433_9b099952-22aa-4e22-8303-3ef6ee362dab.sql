-- Create function to handle connection status change notifications
CREATE OR REPLACE FUNCTION public.notify_connection_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _title TEXT;
    _body TEXT;
    _notification_type TEXT;
BEGIN
    -- Only proceed if connection_status actually changed
    IF OLD.connection_status IS DISTINCT FROM NEW.connection_status THEN
        
        -- Determine notification based on new status
        IF NEW.connection_status = 'suspended' THEN
            _notification_type := 'connection_suspended';
            _title := '⚠️ ইন্টারনেট সংযোগ সাসপেন্ড';
            _body := format('%s, আপনার ইন্টারনেট সংযোগ সাময়িকভাবে বন্ধ করা হয়েছে। বকেয়া পরিশোধ করে সংযোগ পুনরায় সক্রিয় করুন।', NEW.name);
        
        ELSIF NEW.connection_status = 'active' AND OLD.connection_status = 'suspended' THEN
            _notification_type := 'connection_activated';
            _title := '✅ সংযোগ পুনরায় সক্রিয়!';
            _body := format('%s, স্বাগতম! আপনার ইন্টারনেট সংযোগ পুনরায় সক্রিয় করা হয়েছে। ধন্যবাদ!', NEW.name);
        
        ELSIF NEW.connection_status = 'active' AND OLD.connection_status = 'pending' THEN
            _notification_type := 'connection_activated';
            _title := '🎉 সংযোগ সক্রিয় হয়েছে!';
            _body := format('%s, স্বাগতম! আপনার ইন্টারনেট সংযোগ সফলভাবে সক্রিয় করা হয়েছে।', NEW.name);
        
        ELSIF NEW.connection_status = 'pending' THEN
            _notification_type := 'connection_pending';
            _title := '⏳ সংযোগ পেন্ডিং';
            _body := format('%s, আপনার সংযোগ বর্তমানে পেন্ডিং অবস্থায় আছে। শীঘ্রই সক্রিয় হবে।', NEW.name);
        
        ELSE
            -- No notification for other status changes
            RETURN NEW;
        END IF;
        
        -- Insert notification log
        INSERT INTO public.notification_logs (
            tenant_id,
            customer_id,
            notification_type,
            title,
            body,
            data,
            status
        ) VALUES (
            NEW.tenant_id,
            NEW.id,
            _notification_type,
            _title,
            _body,
            jsonb_build_object(
                'old_status', OLD.connection_status,
                'new_status', NEW.connection_status,
                'changed_at', now()
            ),
            'pending'
        );
        
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on customers table
DROP TRIGGER IF EXISTS trigger_connection_status_notification ON public.customers;

CREATE TRIGGER trigger_connection_status_notification
    AFTER UPDATE OF connection_status ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_connection_status_change();