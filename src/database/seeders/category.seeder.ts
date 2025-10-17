import { DataSource } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Service } from '../../entities/service.entity';

interface ServiceData {
  name: string;
  description: string;
  estimatedDuration: number; // in minutes
  basePrice: number;
}

interface CategoryData {
  name: string;
  description: string;
  icon: string;
  services: ServiceData[];
}

const categoriesData: CategoryData[] = [
  {
    name: 'Maintenance',
    description: 'Regular vehicle maintenance and inspection services',
    icon: '🔧',
    services: [
      {
        name: 'Oil Change',
        description: 'Complete oil and filter change service',
        estimatedDuration: 30,
        basePrice: 50,
      },
      {
        name: 'Brake Inspection',
        description: 'Complete brake system inspection and maintenance',
        estimatedDuration: 45,
        basePrice: 60,
      },
      {
        name: 'Tire Rotation',
        description: 'Rotate tires for even wear and better performance',
        estimatedDuration: 30,
        basePrice: 40,
      },
      {
        name: 'Battery Check',
        description: 'Battery health inspection and terminal cleaning',
        estimatedDuration: 20,
        basePrice: 25,
      },
      {
        name: 'Air Filter Replacement',
        description: 'Replace engine and cabin air filters',
        estimatedDuration: 20,
        basePrice: 35,
      },
      {
        name: 'Fluid Top-up',
        description: 'Check and refill all vehicle fluids',
        estimatedDuration: 30,
        basePrice: 30,
      },
      {
        name: 'Spark Plug Replacement',
        description: 'Replace worn spark plugs for better performance',
        estimatedDuration: 60,
        basePrice: 80,
      },
    ],
  },
  {
    name: 'Repairs',
    description: 'Vehicle repair and restoration services',
    icon: '🔨',
    services: [
      {
        name: 'Engine Repair',
        description: 'Comprehensive engine diagnostics and repair',
        estimatedDuration: 240,
        basePrice: 500,
      },
      {
        name: 'Transmission Repair',
        description: 'Transmission diagnostics and repair services',
        estimatedDuration: 300,
        basePrice: 600,
      },
      {
        name: 'Brake Repair',
        description: 'Brake pad, rotor, and caliper replacement',
        estimatedDuration: 90,
        basePrice: 150,
      },
      {
        name: 'Suspension Repair',
        description: 'Shock absorber and suspension system repair',
        estimatedDuration: 120,
        basePrice: 200,
      },
      {
        name: 'Exhaust System Repair',
        description: 'Muffler and exhaust system repair',
        estimatedDuration: 90,
        basePrice: 120,
      },
      {
        name: 'Steering System Repair',
        description: 'Power steering and steering components repair',
        estimatedDuration: 120,
        basePrice: 180,
      },
      {
        name: 'Cooling System Repair',
        description: 'Radiator and cooling system repair',
        estimatedDuration: 90,
        basePrice: 150,
      },
    ],
  },
  {
    name: 'Diagnostics',
    description: 'Vehicle diagnostic and inspection services',
    icon: '🔍',
    services: [
      {
        name: 'Computer Diagnostics',
        description: 'Full vehicle computer system diagnostic scan',
        estimatedDuration: 45,
        basePrice: 70,
      },
      {
        name: 'Pre-Purchase Inspection',
        description: 'Comprehensive vehicle inspection before purchase',
        estimatedDuration: 90,
        basePrice: 100,
      },
      {
        name: 'Check Engine Light',
        description: 'Diagnose and resolve check engine light issues',
        estimatedDuration: 60,
        basePrice: 80,
      },
      {
        name: 'Emission Test',
        description: 'Vehicle emissions testing and certification',
        estimatedDuration: 30,
        basePrice: 50,
      },
      {
        name: 'Safety Inspection',
        description: 'Complete safety systems inspection',
        estimatedDuration: 60,
        basePrice: 65,
      },
    ],
  },
  {
    name: 'Electrical',
    description: 'Electrical system repair and maintenance',
    icon: '⚡',
    services: [
      {
        name: 'Battery Replacement',
        description: 'New battery installation and system check',
        estimatedDuration: 30,
        basePrice: 120,
      },
      {
        name: 'Alternator Repair',
        description: 'Alternator diagnostics and replacement',
        estimatedDuration: 90,
        basePrice: 200,
      },
      {
        name: 'Starter Motor Repair',
        description: 'Starter motor diagnostics and replacement',
        estimatedDuration: 90,
        basePrice: 180,
      },
      {
        name: 'Electrical Wiring Repair',
        description: 'Diagnose and repair electrical wiring issues',
        estimatedDuration: 120,
        basePrice: 150,
      },
      {
        name: 'Lighting System Repair',
        description: 'Headlight, taillight, and interior light repair',
        estimatedDuration: 45,
        basePrice: 60,
      },
      {
        name: 'Fuse Replacement',
        description: 'Replace blown fuses and check circuits',
        estimatedDuration: 20,
        basePrice: 30,
      },
    ],
  },
  {
    name: 'Tires & Wheels',
    description: 'Tire and wheel services',
    icon: '🛞',
    services: [
      {
        name: 'Tire Installation',
        description: 'Install new tires and balance wheels',
        estimatedDuration: 60,
        basePrice: 100,
      },
      {
        name: 'Wheel Alignment',
        description: 'Precision wheel alignment service',
        estimatedDuration: 60,
        basePrice: 80,
      },
      {
        name: 'Tire Balancing',
        description: 'Balance all wheels for smooth driving',
        estimatedDuration: 45,
        basePrice: 50,
      },
      {
        name: 'Flat Tire Repair',
        description: 'Patch and repair punctured tires',
        estimatedDuration: 30,
        basePrice: 25,
      },
      {
        name: 'Wheel Repair',
        description: 'Repair bent or damaged wheels',
        estimatedDuration: 90,
        basePrice: 120,
      },
      {
        name: 'TPMS Service',
        description: 'Tire pressure monitoring system service',
        estimatedDuration: 30,
        basePrice: 60,
      },
    ],
  },
  {
    name: 'Body & Paint',
    description: 'Body work and painting services',
    icon: '🎨',
    services: [
      {
        name: 'Dent Removal',
        description: 'Paintless dent removal service',
        estimatedDuration: 90,
        basePrice: 150,
      },
      {
        name: 'Scratch Repair',
        description: 'Remove scratches and restore paint',
        estimatedDuration: 120,
        basePrice: 200,
      },
      {
        name: 'Full Paint Job',
        description: 'Complete vehicle repainting service',
        estimatedDuration: 480,
        basePrice: 2000,
      },
      {
        name: 'Bumper Repair',
        description: 'Repair or replace damaged bumpers',
        estimatedDuration: 120,
        basePrice: 250,
      },
      {
        name: 'Rust Removal',
        description: 'Remove rust and apply protective coating',
        estimatedDuration: 180,
        basePrice: 300,
      },
      {
        name: 'Panel Replacement',
        description: 'Replace damaged body panels',
        estimatedDuration: 240,
        basePrice: 500,
      },
    ],
  },
  {
    name: 'Climate Control',
    description: 'AC and heating system services',
    icon: '❄️',
    services: [
      {
        name: 'AC Recharge',
        description: 'Recharge air conditioning refrigerant',
        estimatedDuration: 45,
        basePrice: 80,
      },
      {
        name: 'AC Repair',
        description: 'Diagnose and repair AC system issues',
        estimatedDuration: 120,
        basePrice: 200,
      },
      {
        name: 'Heater Repair',
        description: 'Heating system diagnostics and repair',
        estimatedDuration: 90,
        basePrice: 150,
      },
      {
        name: 'Cabin Air Filter',
        description: 'Replace cabin air filter for better air quality',
        estimatedDuration: 20,
        basePrice: 35,
      },
      {
        name: 'Blower Motor Repair',
        description: 'Replace or repair blower motor',
        estimatedDuration: 90,
        basePrice: 180,
      },
    ],
  },
  {
    name: 'Glass & Windows',
    description: 'Windshield and window services',
    icon: '🪟',
    services: [
      {
        name: 'Windshield Replacement',
        description: 'Replace cracked or damaged windshield',
        estimatedDuration: 120,
        basePrice: 300,
      },
      {
        name: 'Windshield Repair',
        description: 'Repair small chips and cracks',
        estimatedDuration: 45,
        basePrice: 80,
      },
      {
        name: 'Window Tinting',
        description: 'Professional window tinting service',
        estimatedDuration: 180,
        basePrice: 250,
      },
      {
        name: 'Window Regulator Repair',
        description: 'Fix power window mechanisms',
        estimatedDuration: 90,
        basePrice: 150,
      },
      {
        name: 'Mirror Replacement',
        description: 'Replace side or rearview mirrors',
        estimatedDuration: 60,
        basePrice: 100,
      },
    ],
  },
  {
    name: 'Detailing',
    description: 'Vehicle cleaning and detailing services',
    icon: '✨',
    services: [
      {
        name: 'Interior Detailing',
        description: 'Deep cleaning of interior surfaces',
        estimatedDuration: 120,
        basePrice: 100,
      },
      {
        name: 'Exterior Detailing',
        description: 'Complete exterior wash and wax',
        estimatedDuration: 120,
        basePrice: 80,
      },
      {
        name: 'Full Detailing',
        description: 'Complete interior and exterior detailing',
        estimatedDuration: 240,
        basePrice: 180,
      },
      {
        name: 'Engine Bay Cleaning',
        description: 'Professional engine compartment cleaning',
        estimatedDuration: 60,
        basePrice: 60,
      },
      {
        name: 'Headlight Restoration',
        description: 'Restore cloudy or yellowed headlights',
        estimatedDuration: 60,
        basePrice: 70,
      },
      {
        name: 'Ceramic Coating',
        description: 'Apply protective ceramic coating',
        estimatedDuration: 360,
        basePrice: 500,
      },
    ],
  },
  {
    name: 'Performance',
    description: 'Performance upgrades and tuning',
    icon: '🏎️',
    services: [
      {
        name: 'ECU Tuning',
        description: 'Engine computer tuning for better performance',
        estimatedDuration: 120,
        basePrice: 300,
      },
      {
        name: 'Exhaust Upgrade',
        description: 'Install performance exhaust system',
        estimatedDuration: 180,
        basePrice: 400,
      },
      {
        name: 'Air Intake Installation',
        description: 'Install cold air intake system',
        estimatedDuration: 90,
        basePrice: 200,
      },
      {
        name: 'Suspension Upgrade',
        description: 'Install performance suspension components',
        estimatedDuration: 240,
        basePrice: 600,
      },
      {
        name: 'Brake Upgrade',
        description: 'Install performance brake system',
        estimatedDuration: 180,
        basePrice: 500,
      },
      {
        name: 'Turbo Installation',
        description: 'Install turbocharger system',
        estimatedDuration: 480,
        basePrice: 2000,
      },
    ],
  },
];

export async function seedCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(Category);
  const serviceRepository = dataSource.getRepository(Service);

  console.log('🌱 Starting categories and services seeding...');

  try {
    let categoriesCreated = 0;
    let categoriesSkipped = 0;
    let servicesCreated = 0;
    let servicesSkipped = 0;

    for (const categoryData of categoriesData) {
      // Check if category already exists
      let category = await categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (category) {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
        categoriesSkipped++;
      } else {
        // Create category
        category = categoryRepository.create({
          name: categoryData.name,
          description: categoryData.description,
          icon: categoryData.icon,
          isActive: true,
        });

        await categoryRepository.save(category);
        categoriesCreated++;
        console.log(`✅ Created category: ${categoryData.name}`);
      }

      // Create services for this category
      for (const serviceData of categoryData.services) {
        // Check if service already exists
        const existingService = await serviceRepository.findOne({
          where: {
            name: serviceData.name,
            category: { id: category.id },
          },
        });

        if (existingService) {
          console.log(`   ⏭️  Service already exists: ${serviceData.name}`);
          servicesSkipped++;
        } else {
          // Create service
          const service = serviceRepository.create({
            name: serviceData.name,
            description: serviceData.description,
            estimatedDuration: serviceData.estimatedDuration,
            basePrice: serviceData.basePrice,
            categoryId: category.id,
            isActive: true,
          });

          await serviceRepository.save(service);
          servicesCreated++;
          console.log(`   ✅ Created service: ${serviceData.name}`);
        }
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   📁 Categories:`);
    console.log(`      ✅ Created: ${categoriesCreated}`);
    console.log(`      ⏭️  Skipped: ${categoriesSkipped}`);
    console.log(`   🔧 Services:`);
    console.log(`      ✅ Created: ${servicesCreated}`);
    console.log(`      ⏭️  Skipped: ${servicesSkipped}`);
    console.log('\n🎉 Categories and services seeding completed!');
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during seeding:', errorMessage);
    throw error;
  }
}
