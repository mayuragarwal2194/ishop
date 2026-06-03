import Address from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { validateObjectId } from "../utils/validateObjectId.js";



export const createAddressService = async (userId, addressData) => {

  // Check how many addresses user already has
  const addressCount = await Address.countDocuments({ user: userId });

  // Create address
  const address = new Address({
    user: userId,
    ...addressData,

    // First address becomes default automatically
    isDefault: addressCount === 0,
  });

  // Save address
  await address.save();

  return address;
};

export const getMyAddressesService = async (userId) => {

  // Get all addresses of the user
  const addresses = await Address.find({
    user: userId,
  }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  return addresses;
};

export const getAddressByIdService = async (userId, addressId,) => {

  // Validate address ID
  const validAddressId = validateObjectId(addressId, "Address");

  // Find address belonging to the user
  const address = await Address.findOne({
    _id: validAddressId,
    user: userId,
  });

  // Check if address exists
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return address;
};

export const updateAddressService = async (userId, addressId, updateData) => {

  // Validate address ID
  const validAddressId = validateObjectId(addressId, "Address");

  // Find address belonging to the user
  const address = await Address.findOne({
    _id: validAddressId,
    user: userId,
  });

  // Check if address exists
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Update address fields
  Object.assign(address, updateData);

  // Save updated address
  await address.save({
    validateBeforeSave: false,
  });

  return address;
};

export const setDefaultAddressService = async (userId, addressId) => {

  // Validate address ID
  const validAddressId = validateObjectId(addressId, "Address");

  // Find address belonging to the user
  const address = await Address.findOne({
    _id: validAddressId,
    user: userId,
  });

  // Check if address exists
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Address is already default
  if (address.isDefault) {
    throw new ApiError(
      400,
      "Address is already the default address"
    );
  }

  // Remove current default address
  await Address.updateMany(
    {
      user: userId,
      isDefault: true,
    },
    {
      isDefault: false,
    }
  );

  // Set selected address as default
  address.isDefault = true;

  await address.save({
    validateBeforeSave: false,
  });

  return address;
};

export const deleteAddressService = async (userId, addressId) => {

  // Validate address ID
  const validAddressId = validateObjectId(addressId, "Address");

  // Find address belonging to the user
  const address = await Address.findOne({
    _id: validAddressId,
    user: userId,
  });

  // Check if address exists
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Store default status before deletion
  const wasDefault = address.isDefault;

  // Delete address
  await address.deleteOne();

  // If deleted address was default,
  // assign another address as default
  if (wasDefault) {

    const anotherAddress =
      await Address
        .findOne({ user: userId, })
        .sort({ createdAt: 1, });

    if (anotherAddress) {
      anotherAddress.isDefault = true;

      await anotherAddress.save({
        validateBeforeSave: false,
      });
    }
  }

  return;
};