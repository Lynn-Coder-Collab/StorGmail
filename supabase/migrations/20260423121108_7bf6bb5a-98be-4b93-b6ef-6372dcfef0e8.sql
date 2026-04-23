
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create withdrawals"
ON public.withdrawals FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
