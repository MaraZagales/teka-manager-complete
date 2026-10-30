namespace TEKAManager.Core.Services;

public sealed class DuplicateCustomerDocumentException()
    : InvalidOperationException("Ya existe un cliente con este tipo y número de documento.");
