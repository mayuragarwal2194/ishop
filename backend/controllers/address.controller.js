import { createAddressService, deleteAddressService, getAddressByIdService, getMyAddressesService, setDefaultAddressService, updateAddressService } from "../services/address.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAddress = asyncHandler(async (req, res) => {
  const result = await createAddressService(
    req.user._id,
    req.validatedData
  );

  return ApiResponse(
    res,
    201,
    "Address created successfully",
    result
  );
});

export const getMyAddresses = asyncHandler(async (req, res) => {
  const result = await getMyAddressesService(
    req.user._id
  );

  return ApiResponse(
    res,
    200,
    "Address fetched successfully",
    result
  );
});

export const getAddressById = asyncHandler(async (req, res) => {
  const result = await getAddressByIdService(
    req.user._id,
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Address fetched successfully",
    result
  );
});

export const updateAddress = asyncHandler(async (req, res) => {
  const result = await updateAddressService(
    req.user._id,
    req.params.id,
    req.validatedData
  );

  return ApiResponse(
    res,
    200,
    "Address updated successfully",
    result
  );
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const result = await setDefaultAddressService(
    req.user._id,
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Default address updated successfully",
    result
  );
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await deleteAddressService(
    req.user._id,
    req.params.id
  );

  return ApiResponse(
    res,
    200,
    "Address deleted successfully",
    result
  );
});