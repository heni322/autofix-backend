import { IsBoolean, IsNotEmpty, IsArray, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class MarkAsReadDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isRead!: boolean;
}
export class BulkMarkAsReadDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  notificationIds!: string[];
}