import { z } from 'zod';

const templateSchema = z.object({
  key: z.string(),
});
type templateType = z.infer<typeof templateSchema>;

// export default templateType;
