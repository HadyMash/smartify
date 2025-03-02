import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const objectIdStringSchema = z
  .union([
    z.coerce.string(),
    z.instanceof(ObjectId).transform((val) => val.toString()),
  ])
  .refine((val) => ObjectId.isValid(val), { message: 'Invalid ObjectID' });

export type ObjectIdString = z.infer<typeof objectIdStringSchema>;

//export const objectIdSchema = objectIdStringSchema.transform(
//  (val) => new ObjectId(val),
//);
export const objectIdSchema = z
  .union([objectIdStringSchema, z.instanceof(ObjectId)])
  .transform((val) => (val instanceof ObjectId ? val : new ObjectId(val)));

export const objectIdOrStringSchema = z.union([
  objectIdSchema,
  objectIdStringSchema,
]);

export type ObjectIdOrString = z.infer<typeof objectIdOrStringSchema>;
