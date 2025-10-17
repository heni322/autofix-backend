import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { Garage } from '../../entities/garage.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

interface GarageData {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  telephone_international: string;
}

export async function seedGarages(dataSource: DataSource) {
  const garageRepository = dataSource.getRepository(Garage);
  const userRepository = dataSource.getRepository(User);

  console.log('🌱 Starting garage seeding...');

  try {
    // Read Excel file
    const filePath = path.join(__dirname, '../../../garages_tunisia_contacts.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: GarageData[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${data.length} garages in Excel file`);

    // Create a default garage owner if not exists
    let defaultOwner = await userRepository.findOne({
      where: { email: 'garage-owner@system.com' },
    });

    if (!defaultOwner) {
      console.log('👤 Creating default garage owner...');
      const hashedPassword = await bcrypt.hash('DefaultPassword123!', 10);
      
      const ownerData = {
        email: 'garage-owner@system.com',
        firstName: 'System',
        lastName: 'Owner',
        phone: '+216 00 000 000',
        password: hashedPassword,
        role: UserRole.GARAGE_OWNER,
        isActive: true,
        emailVerified: true,
      };
      
      defaultOwner = userRepository.create(ownerData);
      await userRepository.save(defaultOwner);
      console.log('✅ Default owner created');
    }

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        // Skip if essential data is missing
        if (!row.nom || !row.adresse || !row.ville) {
          console.log(`⚠️  Skipping row - missing essential data: ${row.nom || 'N/A'}`);
          skippedCount++;
          continue;
        }

        // Check if garage already exists
        const existingGarage = await garageRepository.findOne({
          where: { name: row.nom },
        });

        if (existingGarage) {
          console.log(`⏭️  Garage already exists: ${row.nom}`);
          skippedCount++;
          continue;
        }

        // Extract phone number (use telephone or telephone_international)
        const phoneNumber = row.telephone_international || 
                           (row.telephone ? `+216 ${row.telephone}` : '+216 00 000 000');

        // Clean phone for validation
        const cleanPhone = phoneNumber.replace(/\s+/g, ' ').trim();

        // Extract postal code from address if possible
        const postalCodeMatch = row.adresse.match(/\b\d{4}\b/);
        const postalCode = postalCodeMatch ? postalCodeMatch[0] : '0000';

        // Create garage - Use undefined instead of null for optional fields
        const garage = garageRepository.create({
          name: row.nom.trim(),
          description: `Professional garage service in ${row.ville}. Located at ${row.adresse}.`,
          address: row.adresse.trim(),
          city: row.ville.trim(),
          postalCode: postalCode,
          phone: cleanPhone,
          images: [],
          openingHours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '18:00' },
            saturday: { open: '08:00', close: '13:00' },
            sunday: { open: 'closed', close: 'closed' },
          },
          isActive: true,
          isVerified: false,
          ownerId: defaultOwner.id,
        });

        await garageRepository.save(garage);
        
        createdCount++;
        console.log(`✅ Created garage: ${row.nom} in ${row.ville}`);

      } catch (error: unknown) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error creating garage ${row.nom}:`, errorMessage);
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Created: ${createdCount} garages`);
    console.log(`   ⏭️  Skipped: ${skippedCount} garages`);
    console.log(`   ❌ Errors: ${errorCount} garages`);
    console.log(`   📝 Total rows processed: ${data.length}`);
    console.log('\n🎉 Garage seeding completed!');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during seeding:', errorMessage);
    throw error;
  }
}
